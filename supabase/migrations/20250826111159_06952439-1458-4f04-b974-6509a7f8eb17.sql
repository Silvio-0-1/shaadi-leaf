-- Fix the security vulnerability in shared_wedding_cards RLS policy
-- The current policy still allows public access when is_public=true
-- We need to restrict access to only token-based sharing

-- Drop the existing vulnerable policy
DROP POLICY IF EXISTS "Allow access with valid share token" ON public.shared_wedding_cards;

-- Create a secure policy that requires either ownership or a specific token lookup
-- This ensures no public enumeration of cards is possible
CREATE POLICY "Secure token-based access only" 
ON public.shared_wedding_cards 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.shared_wedding_cards AS lookup
    WHERE lookup.id = shared_wedding_cards.id 
    AND lookup.share_token IS NOT NULL
    AND lookup.share_token = current_setting('request.jwt.claims', true)::json->>'share_token'
  )
);

-- Since we're using token-based sharing exclusively, we can make is_public obsolete
-- Set all existing records to have is_public=false for clarity (but policy doesn't depend on it)
UPDATE public.shared_wedding_cards 
SET is_public = false 
WHERE is_public = true;