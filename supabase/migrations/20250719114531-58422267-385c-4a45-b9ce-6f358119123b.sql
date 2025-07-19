
-- First, let's add missing columns to the existing wedding_cards table
ALTER TABLE public.wedding_cards 
ADD COLUMN IF NOT EXISTS uploaded_images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS logo_image text,
ADD COLUMN IF NOT EXISTS customization jsonb DEFAULT '{}'::jsonb;

-- Create the shared_wedding_cards table for shareable links
CREATE TABLE IF NOT EXISTS public.shared_wedding_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  bride_name text NOT NULL,
  groom_name text NOT NULL,
  wedding_date text NOT NULL,
  venue text NOT NULL,
  message text,
  template_id text NOT NULL,
  uploaded_images jsonb DEFAULT '[]'::jsonb,
  logo_image text,
  customization jsonb DEFAULT '{}'::jsonb,
  element_positions jsonb,
  is_public boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on shared_wedding_cards
ALTER TABLE public.shared_wedding_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_wedding_cards
CREATE POLICY "Users can create their own shared cards" 
  ON public.shared_wedding_cards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shared cards" 
  ON public.shared_wedding_cards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared cards" 
  ON public.shared_wedding_cards 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public shared cards" 
  ON public.shared_wedding_cards 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Users can view their own shared cards" 
  ON public.shared_wedding_cards 
  FOR SELECT 
  USING (auth.uid() = user_id);
