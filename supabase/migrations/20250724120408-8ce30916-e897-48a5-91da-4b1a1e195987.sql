-- CRITICAL SECURITY FIXES

-- 1. Remove dangerous user credits UPDATE policy that allows users to modify their own credits
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- 2. Add proper RLS policies for user_roles table (currently missing)
-- First, enable RLS if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add admin-only policies for user_roles management
CREATE POLICY "Only admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Fix database function search paths to prevent SQL injection
-- Update all security-critical functions to use empty search path

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role (use ON CONFLICT to avoid duplicates)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_manage_credits(p_target_user_id uuid, p_amount integer, p_operation text, p_description text, p_admin_user_id uuid)
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
    
  ELSE
    RAISE EXCEPTION 'Invalid operation. Use "add" or "deduct".';
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_action_type text, p_description text, p_reference_id text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_credits
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, description, action_type, reference_id
  ) VALUES (
    p_user_id, -p_amount, 'deduction', p_description, p_action_type, p_reference_id
  );
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Add credits
  UPDATE public.user_credits
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- If no existing record, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (p_user_id, p_amount);
  END IF;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, description, reference_id
  ) VALUES (
    p_user_id, p_amount, 'purchase', p_description, p_reference_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 100);
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 100, 'signup_bonus', 'Welcome bonus - 100 free credits');
  
  RETURN NEW;
END;
$$;