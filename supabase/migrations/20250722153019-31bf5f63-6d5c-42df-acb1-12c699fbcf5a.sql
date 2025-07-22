-- Create tags table for organizing templates
CREATE TABLE IF NOT EXISTS public.template_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color text DEFAULT '#8b5cf6',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on template_tags
ALTER TABLE public.template_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for template_tags
CREATE POLICY "Everyone can view tags" 
  ON public.template_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can create tags" 
  ON public.template_tags 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update tags" 
  ON public.template_tags 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete tags" 
  ON public.template_tags 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add tags field to custom_templates table
ALTER TABLE public.custom_templates 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Insert some default tags
INSERT INTO public.template_tags (name, color, description) VALUES
  ('floral', '#ef4444', 'Templates with flower designs and botanical elements'),
  ('classic', '#3b82f6', 'Traditional and timeless wedding designs'),
  ('modern', '#8b5cf6', 'Contemporary and minimalist styles'),
  ('minimal', '#64748b', 'Clean and simple designs'),
  ('royal', '#dc2626', 'Elegant and luxurious designs'),
  ('haldi', '#f59e0b', 'Perfect for haldi and pre-wedding ceremonies'),
  ('rustic', '#92400e', 'Countryside and vintage-inspired designs'),
  ('elegant', '#7c3aed', 'Sophisticated and refined styles')
ON CONFLICT (name) DO NOTHING;