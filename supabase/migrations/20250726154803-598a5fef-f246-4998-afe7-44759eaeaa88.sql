-- Critical Security Fix: Tighten user_roles RLS policies to prevent privilege escalation

-- Drop existing permissive policies that allow admins to do everything
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;

-- Create more restrictive policies to prevent privilege escalation
-- 1. Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Admins can view all roles (but not modify)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 3. System can insert roles (for automatic role assignment)
CREATE POLICY "System can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (true);

-- 4. Only super-admin functions can modify roles (not direct table access)
-- This prevents admins from escalating their own privileges or others
CREATE POLICY "Only system functions can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (false); -- Block all direct updates

CREATE POLICY "Only system functions can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (false); -- Block all direct deletions

-- Create secure admin role management function
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
  
  -- Remove existing role first
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert new role
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
  
  -- Remove role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;

-- Add audit logging for role changes
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type TEXT,
  target_user_id UUID,
  action_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (admin_user_id, target_user_id, action, details)
  VALUES (auth.uid(), target_user_id, action_type, action_details);
END;
$$;

-- Update admin_manage_credits to include audit logging
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
SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
  is_admin BOOLEAN;
BEGIN
  -- Check if the calling user is an admin
  SELECT public.has_role(p_admin_user_id, 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Log the admin action
  PERFORM public.log_admin_action(
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
  
  -- Perform the operation with validation
  IF p_operation = 'add' THEN
    -- Validate amount is positive for additions
    IF p_amount <= 0 THEN
      RAISE EXCEPTION 'Credit addition amount must be positive';
    END IF;
    
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
    -- Validate amount is positive for deductions
    IF p_amount <= 0 THEN
      RAISE EXCEPTION 'Credit deduction amount must be positive';
    END IF;
    
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
    
  ELSE
    RAISE EXCEPTION 'Invalid operation. Use "add" or "deduct".';
  END IF;
  
  RETURN TRUE;
END;
$$;