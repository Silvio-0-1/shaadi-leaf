-- Add admin function to manage user credits
CREATE OR REPLACE FUNCTION public.admin_manage_credits(
  p_target_user_id UUID,
  p_amount INTEGER,
  p_operation TEXT, -- 'add' or 'deduct'
  p_description TEXT,
  p_admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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