export interface VenueIcon {
  id: string;
  name: string;
  description: string | null;
  svg_path: string;
  category: string;
  is_filled: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface VenueIconInsert {
  name: string;
  description?: string;
  svg_path: string;
  category?: string;
  is_filled?: boolean;
  is_active?: boolean;
  display_order?: number;
}

export interface VenueIconUpdate {
  name?: string;
  description?: string;
  svg_path?: string;
  category?: string;
  is_filled?: boolean;
  is_active?: boolean;
  display_order?: number;
}
