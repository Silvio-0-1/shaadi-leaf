-- Fix the deduct_credits function to properly reference the app_role type
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_action_type text, p_description text, p_reference_id text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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