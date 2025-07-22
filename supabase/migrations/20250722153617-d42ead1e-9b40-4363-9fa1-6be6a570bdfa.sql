-- Create tag_groups table
CREATE TABLE IF NOT EXISTS public.tag_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#8b5cf6',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tag_groups
ALTER TABLE public.tag_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for tag_groups
CREATE POLICY "Everyone can view tag groups" 
  ON public.tag_groups 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can create tag groups" 
  ON public.tag_groups 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update tag groups" 
  ON public.tag_groups 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete tag groups" 
  ON public.tag_groups 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add group_id to template_tags table
ALTER TABLE public.template_tags 
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.tag_groups(id) ON DELETE SET NULL;

-- Insert default tag groups
INSERT INTO public.tag_groups (name, color, description) VALUES
  ('Style', '#ef4444', 'Visual style and aesthetic categories'),
  ('Occasion', '#f59e0b', 'Wedding events and ceremony types'),
  ('Theme', '#8b5cf6', 'Overall theme and mood'),
  ('Color Scheme', '#10b981', 'Color palette categories')
ON CONFLICT (name) DO NOTHING;

-- Update existing tags with group assignments
UPDATE public.template_tags 
SET group_id = (SELECT id FROM public.tag_groups WHERE name = 'Style')
WHERE name IN ('floral', 'classic', 'modern', 'minimal', 'royal', 'rustic', 'elegant');

UPDATE public.template_tags 
SET group_id = (SELECT id FROM public.tag_groups WHERE name = 'Occasion')
WHERE name IN ('haldi');