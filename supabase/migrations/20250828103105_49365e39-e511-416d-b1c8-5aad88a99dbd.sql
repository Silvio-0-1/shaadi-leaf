-- Fix type casting issue in deduct_credits function where has_role is called with string instead of app_role enum

CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_action_type text, p_description text, p_reference_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_balance INTEGER;
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Check authorization: user must be the owner OR admin (fix type casting)
  IF current_user_id != p_user_id AND NOT has_role(current_user_id, 'admin'::app_role) THEN
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
$function$;

-- Also fix the add_credits function for consistency
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_amount integer, p_description text, p_reference_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Only admins can add credits (except for system operations) - fix type casting
  IF NOT has_role(current_user_id, 'admin'::app_role) THEN
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
$function$;