-- SECURITY FIXES MIGRATION

-- 1. Fix user_roles table security - prevent privilege escalation
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Block direct role deletions" ON public.user_roles;  
DROP POLICY IF EXISTS "Block direct role updates" ON public.user_roles;

-- Add unique constraint to prevent duplicate roles
ALTER TABLE public.user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);

-- Create secure policies for user_roles
CREATE POLICY "Block all direct inserts" ON public.user_roles
FOR INSERT WITH CHECK (false);

CREATE POLICY "Block all direct updates" ON public.user_roles  
FOR UPDATE USING (false);

CREATE POLICY "Block all direct deletes" ON public.user_roles
FOR DELETE USING (false);

-- Keep existing SELECT policies (they're already secure)

-- 2. Fix admin_manage_credits RPC to use auth.uid() instead of parameter
CREATE OR REPLACE FUNCTION public.admin_manage_credits(
  p_target_user_id uuid, 
  p_amount integer, 
  p_operation text, 
  p_description text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
  is_admin BOOLEAN;
  current_admin_id UUID;
BEGIN
  -- Get current admin user ID from auth context
  current_admin_id := auth.uid();
  
  -- Check if the calling user is an admin
  SELECT has_role(current_admin_id, 'admin') INTO is_admin;
  
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
  
  -- Log the admin action with current admin ID
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

-- 3. Secure credit RPCs - update deduct_credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid, 
  p_amount integer, 
  p_action_type text, 
  p_description text, 
  p_reference_id text DEFAULT NULL::text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_balance INTEGER;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check authorization: user must be the owner OR admin
  IF current_user_id != p_user_id AND NOT has_role(current_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. You can only manage your own credits.';
  END IF;
  
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

-- 4. Secure add_credits RPC - only admins can add credits
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid, 
  p_amount integer, 
  p_description text, 
  p_reference_id text DEFAULT NULL::text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Only admins can add credits (except for system operations)
  IF NOT has_role(current_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied. Only admins can add credits.';
  END IF;
  
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

-- 5. Lock down user_credits policies
DROP POLICY IF EXISTS "System can insert credits" ON public.user_credits;

-- Add unique constraint for user_credits
ALTER TABLE public.user_credits ADD CONSTRAINT unique_user_credits UNIQUE (user_id);

-- Block direct client inserts/updates/deletes on user_credits
CREATE POLICY "Block direct client inserts" ON public.user_credits
FOR INSERT WITH CHECK (false);

CREATE POLICY "Block direct client updates" ON public.user_credits  
FOR UPDATE USING (false);

CREATE POLICY "Block direct client deletes" ON public.user_credits
FOR DELETE USING (false);

-- 6. Lock down credit_transactions policies  
DROP POLICY IF EXISTS "System can insert transactions" ON public.credit_transactions;

CREATE POLICY "Users can insert their own transactions" ON public.credit_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Block direct client updates on transactions" ON public.credit_transactions
FOR UPDATE USING (false);

CREATE POLICY "Block direct client deletes on transactions" ON public.credit_transactions  
FOR DELETE USING (false);

-- 7. Fix shared_wedding_cards recursion issue
DROP POLICY IF EXISTS "Secure token-based access only" ON public.shared_wedding_cards;

-- Create secure RPC for fetching shared cards
CREATE OR REPLACE FUNCTION public.fetch_shared_card(p_share_token text)
RETURNS TABLE (
  id uuid,
  bride_name text,
  groom_name text, 
  wedding_date text,
  venue text,
  message text,
  template_id text,
  logo_image text,
  uploaded_images jsonb,
  customization jsonb,
  element_positions jsonb,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    s.id,
    s.bride_name,
    s.groom_name,
    s.wedding_date, 
    s.venue,
    s.message,
    s.template_id,
    s.logo_image,
    s.uploaded_images,
    s.customization,
    s.element_positions,
    s.created_at
  FROM public.shared_wedding_cards s
  WHERE s.share_token = p_share_token 
    AND s.is_public = true;
$$;

-- Add performance index
CREATE INDEX IF NOT EXISTS idx_shared_wedding_cards_share_token ON public.shared_wedding_cards(share_token);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);

-- 8. Ensure triggers are attached for server-side initialization
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS initialize_credits_trigger ON auth.users;  
CREATE TRIGGER initialize_credits_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();