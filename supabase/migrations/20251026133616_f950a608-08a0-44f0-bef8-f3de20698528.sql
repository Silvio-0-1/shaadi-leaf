-- Create venue_icons table
CREATE TABLE IF NOT EXISTS public.venue_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  svg_path TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'location',
  is_filled BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_icons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active venue icons"
  ON public.venue_icons
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all venue icons"
  ON public.venue_icons
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert venue icons"
  ON public.venue_icons
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update venue icons"
  ON public.venue_icons
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete venue icons"
  ON public.venue_icons
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default premium venue icons
INSERT INTO public.venue_icons (name, description, svg_path, category, is_filled, display_order) VALUES
  ('Classic Map Pin', 'Traditional location marker', 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', 'location', false, 1),
  ('Heart Pin', 'Romantic heart location marker', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', 'location', true, 2),
  ('Star Pin', 'Special event marker', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'location', true, 3),
  ('Church', 'Traditional wedding venue', 'M18 2l2 4v14H4V6l2-4h12zm-7 8h2v2h2v2h-2v2h-2v-2H9v-2h2v-2zm1-6c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z', 'building', false, 4),
  ('Tent', 'Outdoor celebration venue', 'M12 2L2 22h20L12 2zm0 4l7 14H5l7-14z', 'building', false, 5),
  ('Castle', 'Grand venue', 'M3 21v-8l4-4V3h2v2h2V3h2v2h2V3h2v6l4 4v8h-6v-4h-4v4H3z', 'building', false, 6),
  ('Tree', 'Garden or outdoor setting', 'M12 3L8 9H6l4 6v6h4v-6l4-6h-2l-4-6z', 'nature', false, 7),
  ('Flower', 'Floral venue decoration', 'M12 22c-1.1 0-2-.9-2-2v-2c-2.76 0-5-2.24-5-5 0-2.64 2.05-4.78 4.65-4.96C10.26 5.54 11.97 4 14 4c2.21 0 4 1.79 4 4 0 .34-.05.67-.14.98 2.27.73 3.98 2.81 3.98 5.27 0 3.04-2.46 5.5-5.5 5.5h-.34v2c0 1.1-.9 2-2 2z', 'nature', true, 8),
  ('Diamond', 'Elegant decorative marker', 'M12 2l5 9-5 9-5-9 5-9z', 'decorative', false, 9),
  ('Crown', 'Premium venue marker', 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z', 'decorative', true, 10);