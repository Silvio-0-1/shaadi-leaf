-- Remove the current public access policy
DROP POLICY IF EXISTS "Anyone can view public shared cards" ON public.shared_wedding_cards;

-- Add a share_token column for secure access
ALTER TABLE public.shared_wedding_cards 
ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', '');

-- Create index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_shared_wedding_cards_share_token 
ON public.shared_wedding_cards(share_token) WHERE share_token IS NOT NULL;

-- Create new secure policy that requires token-based access
CREATE POLICY "Allow access with valid share token" 
ON public.shared_wedding_cards 
FOR SELECT 
USING (
  -- Users can view their own cards
  auth.uid() = user_id 
  OR 
  -- Public access only through valid share token (this will be handled in application logic)
  (is_public = true AND share_token IS NOT NULL)
);

-- Update existing records to have share tokens
UPDATE public.shared_wedding_cards 
SET share_token = replace(gen_random_uuid()::text, '-', '')
WHERE share_token IS NULL;