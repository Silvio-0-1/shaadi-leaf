-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_user_id UUID,
  action_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
  VALUES (auth.uid(), target_user_id, action_type, action_details);
END;
$$;

-- Create secure admin role management functions with proper search path
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  target_user_email TEXT,
  new_role app_role,
  admin_user_id UUID DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  admin_role app_role;
BEGIN
  -- Verify admin privileges
  SELECT get_user_role() INTO admin_role;
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_user_email;
  END IF;
  
  -- Prevent self-privilege escalation to admin (security measure)
  IF target_user_id = admin_user_id AND new_role = 'admin' THEN
    RAISE EXCEPTION 'Cannot modify your own admin privileges';
  END IF;
  
  -- Log the action
  PERFORM log_admin_action(
    'role_change',
    target_user_id,
    jsonb_build_object('new_role', new_role, 'user_email', target_user_email)
  );
  
  -- Remove existing role first, then insert new role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
  
  RETURN true;
END;
$$;

-- Create function to safely remove user role
CREATE OR REPLACE FUNCTION public.admin_remove_user_role(
  target_user_email TEXT,
  admin_user_id UUID DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  admin_role app_role;
BEGIN
  -- Verify admin privileges
  SELECT get_user_role() INTO admin_role;
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_user_email;
  END IF;
  
  -- Prevent removing your own admin role (security measure)
  IF target_user_id = admin_user_id THEN
    RAISE EXCEPTION 'Cannot remove your own admin privileges';
  END IF;
  
  -- Log the action
  PERFORM log_admin_action(
    'role_removal',
    target_user_id,
    jsonb_build_object('user_email', target_user_email)
  );
  
  -- Remove role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Update admin_manage_credits to fix search path
CREATE OR REPLACE FUNCTION public.admin_manage_credits(
  p_target_user_id uuid, 
  p_amount integer, 
  p_operation text, 
  p_description text, 
  p_admin_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance INTEGER;
  is_admin BOOLEAN;
BEGIN
  -- Check if the calling user is an admin
  SELECT has_role(p_admin_user_id, 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Validate inputs
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF p_operation NOT IN ('add', 'deduct') THEN
    RAISE EXCEPTION 'Invalid operation. Use "add" or "deduct".';
  END IF;
  
  -- Log the admin action
  PERFORM log_admin_action(
    'credit_management',
    p_target_user_id,
    jsonb_build_object(
      'operation', p_operation,
      'amount', p_amount,
      'description', p_description
    )
  );
  
  -- Get current balance with row lock
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_target_user_id
  FOR UPDATE;
  
  -- If user doesn't have credits record, create one
  IF current_balance IS NULL THEN
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (p_target_user_id, 0);
    current_balance := 0;
  END IF;
  
  -- Perform the operation
  IF p_operation = 'add' THEN
    -- Add credits
    UPDATE public.user_credits
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
    -- Record transaction
    INSERT INTO public.credit_transactions (
      user_id, amount, transaction_type, description, action_type
    ) VALUES (
      p_target_user_id, p_amount, 'admin_credit', p_description, 'admin_add'
    );
    
  ELSIF p_operation = 'deduct' THEN
    -- Check if user has enough credits for deduction
    IF current_balance < p_amount THEN
      RETURN FALSE;
    END IF;
    
    -- Deduct credits
    UPDATE public.user_credits
    SET balance = balance - p_amount,
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
    -- Record transaction
    INSERT INTO public.credit_transactions (
      user_id, amount, transaction_type, description, action_type
    ) VALUES (
      p_target_user_id, -p_amount, 'admin_debit', p_description, 'admin_deduct'
    );
  END IF;
  
  RETURN TRUE;
END;
$$;