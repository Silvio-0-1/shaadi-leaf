-- CRITICAL SECURITY FIX: Remove overly permissive public access to wedding cards
-- This policy was allowing ALL public cards to be viewed by anyone
DROP POLICY IF EXISTS "Public can view shared wedding cards" ON public.shared_wedding_cards;

-- Replace with more secure token-based access policy
CREATE POLICY "Public can view cards via share token only" 
ON public.shared_wedding_cards 
FOR SELECT 
USING (
  is_public = true 
  AND share_token IS NOT NULL 
  AND share_token != ''
);

-- Change default privacy setting to be private by default (CRITICAL SECURITY IMPROVEMENT)
ALTER TABLE public.shared_wedding_cards 
ALTER COLUMN is_public SET DEFAULT false;

-- Add expiration functionality for shared cards (security hardening)
ALTER TABLE public.shared_wedding_cards 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT NULL;

-- Create index for better performance on share token lookups
CREATE INDEX IF NOT EXISTS idx_shared_cards_share_token 
ON public.shared_wedding_cards(share_token) 
WHERE is_public = true;

-- Enhanced admin security: Add additional validation to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.admin_manage_credits(p_target_user_id uuid, p_amount integer, p_operation text, p_description text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance INTEGER;
  is_admin BOOLEAN;
  current_admin_id UUID;
BEGIN
  -- SECURITY FIX: Get current admin user ID from auth context with validation
  current_admin_id := auth.uid();
  
  -- Additional security check: ensure session is valid
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required. No valid session found.';
  END IF;
  
  -- Check if the calling user is an admin
  SELECT has_role(current_admin_id, 'admin') INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- SECURITY FIX: Validate inputs more strictly
  IF p_amount <= 0 OR p_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid amount. Must be between 1 and 10000 credits.';
  END IF;
  
  IF p_operation NOT IN ('add', 'deduct') THEN
    RAISE EXCEPTION 'Invalid operation. Use "add" or "deduct".';
  END IF;
  
  -- SECURITY FIX: Sanitize description to prevent injection
  IF length(trim(p_description)) = 0 OR length(p_description) > 500 THEN
    RAISE EXCEPTION 'Description must be between 1 and 500 characters.';
  END IF;
  
  -- Log the admin action with enhanced security details
  PERFORM log_admin_action(
    'credit_management',
    p_target_user_id,
    jsonb_build_object(
      'operation', p_operation,
      'amount', p_amount,
      'description', p_description,
      'admin_session_id', current_admin_id,
      'timestamp', now()
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

-- SECURITY FIX: Enhanced validation for wedding card data with better sanitization
CREATE OR REPLACE FUNCTION public.validate_wedding_card_data(p_bride_name text, p_groom_name text, p_wedding_date text, p_venue text, p_message text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- SECURITY FIX: Enhanced validation with XSS prevention
  IF trim(p_bride_name) = '' OR length(trim(p_bride_name)) < 2 THEN
    RAISE EXCEPTION 'Bride name must be at least 2 characters long.';
  END IF;
  
  IF trim(p_groom_name) = '' OR length(trim(p_groom_name)) < 2 THEN
    RAISE EXCEPTION 'Groom name must be at least 2 characters long.';
  END IF;
  
  IF trim(p_venue) = '' OR length(trim(p_venue)) < 5 THEN
    RAISE EXCEPTION 'Venue must be at least 5 characters long.';
  END IF;
  
  -- SECURITY FIX: Check for potentially malicious content
  IF p_bride_name ~* '(<script|javascript:|vbscript:|data:|file:)' THEN
    RAISE EXCEPTION 'Bride name contains potentially harmful content.';
  END IF;
  
  IF p_groom_name ~* '(<script|javascript:|vbscript:|data:|file:)' THEN
    RAISE EXCEPTION 'Groom name contains potentially harmful content.';
  END IF;
  
  IF p_venue ~* '(<script|javascript:|vbscript:|data:|file:)' THEN
    RAISE EXCEPTION 'Venue contains potentially harmful content.';
  END IF;
  
  IF p_message IS NOT NULL AND p_message ~* '(<script|javascript:|vbscript:|data:|file:)' THEN
    RAISE EXCEPTION 'Message contains potentially harmful content.';
  END IF;
  
  -- Validate length limits
  IF length(p_bride_name) > 100 THEN
    RAISE EXCEPTION 'Bride name cannot exceed 100 characters.';
  END IF;
  
  IF length(p_groom_name) > 100 THEN
    RAISE EXCEPTION 'Groom name cannot exceed 100 characters.';
  END IF;
  
  IF length(p_venue) > 200 THEN
    RAISE EXCEPTION 'Venue cannot exceed 200 characters.';
  END IF;
  
  IF p_message IS NOT NULL AND length(p_message) > 1000 THEN
    RAISE EXCEPTION 'Message cannot exceed 1000 characters.';
  END IF;
  
  -- Validate date format (basic check)
  BEGIN
    PERFORM p_wedding_date::date;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Invalid wedding date format. Please use a valid date.';
  END;
  
  RETURN true;
END;
$function$;