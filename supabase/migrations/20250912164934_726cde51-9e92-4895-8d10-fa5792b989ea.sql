-- Fix critical shared wedding cards access issue
-- Add RLS policy to allow public access to shared cards where is_public = true
CREATE POLICY "Public can view shared wedding cards"
ON public.shared_wedding_cards
FOR SELECT
USING (is_public = true);

-- Ensure existing shared cards are set to public by default
UPDATE public.shared_wedding_cards
SET is_public = true
WHERE is_public IS NULL OR is_public = false;

-- Add server-side validation function for credit operations to prevent abuse
CREATE OR REPLACE FUNCTION public.validate_credit_operation(
  p_amount integer,
  p_operation_type text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_operations_count integer;
  user_balance integer;
BEGIN
  -- Rate limiting: Check for excessive operations in the last hour
  SELECT COUNT(*)
  INTO recent_operations_count
  FROM public.credit_transactions
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 hour'
    AND action_type = p_operation_type;
  
  -- Limit to 100 operations per hour per user
  IF recent_operations_count > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Too many credit operations in the last hour.';
  END IF;
  
  -- Validate amount is reasonable (between 1 and 1000 credits)
  IF p_amount < 1 OR p_amount > 1000 THEN
    RAISE EXCEPTION 'Invalid credit amount. Must be between 1 and 1000.';
  END IF;
  
  -- For deduction operations, ensure user has sufficient balance
  IF p_operation_type LIKE '%deduct%' OR p_operation_type LIKE '%spend%' THEN
    SELECT balance INTO user_balance
    FROM public.user_credits
    WHERE user_id = p_user_id;
    
    IF user_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient credits for operation.';
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Add enhanced validation for wedding card data
CREATE OR REPLACE FUNCTION public.validate_wedding_card_data(
  p_bride_name text,
  p_groom_name text,
  p_wedding_date text,
  p_venue text,
  p_message text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate required fields are not empty after trimming
  IF trim(p_bride_name) = '' OR length(trim(p_bride_name)) < 2 THEN
    RAISE EXCEPTION 'Bride name must be at least 2 characters long.';
  END IF;
  
  IF trim(p_groom_name) = '' OR length(trim(p_groom_name)) < 2 THEN
    RAISE EXCEPTION 'Groom name must be at least 2 characters long.';
  END IF;
  
  IF trim(p_venue) = '' OR length(trim(p_venue)) < 5 THEN
    RAISE EXCEPTION 'Venue must be at least 5 characters long.';
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
$$;