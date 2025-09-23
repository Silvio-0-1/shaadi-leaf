import { MapPin, Navigation, Compass, Locate, Map, Target } from 'lucide-react';

export interface VenueStyle {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  alignment: 'left' | 'right' | 'top' | 'bottom';
  fontSize: string;
  fontWeight: string;
  iconSize: number;
  spacing: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  letterSpacing?: string;
}

export const VENUE_STYLES: VenueStyle[] = [
  {
    id: 'classic-left',
    name: 'Classic Left',
    description: 'Traditional pin on the left',
    icon: MapPin,
    alignment: 'left',
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    iconSize: 20,
    spacing: 'gap-2',
  },
  {
    id: 'classic-right',
    name: 'Classic Right',
    description: 'Traditional pin on the right',
    icon: MapPin,
    alignment: 'right',
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    iconSize: 20,
    spacing: 'gap-2',
  },
  {
    id: 'modern-top',
    name: 'Modern Top',
    description: 'Clean icon above text',
    icon: Navigation,
    alignment: 'top',
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    iconSize: 18,
    spacing: 'gap-1',
    textTransform: 'uppercase',
    letterSpacing: 'tracking-wide',
  },
  {
    id: 'elegant-left',
    name: 'Elegant Left',
    description: 'Refined compass style',
    icon: Compass,
    alignment: 'left',
    fontSize: 'text-lg',
    fontWeight: 'font-light',
    iconSize: 22,
    spacing: 'gap-3',
  },
  {
    id: 'minimal-left',
    name: 'Minimal Left',
    description: 'Simple dot indicator',
    icon: Locate,
    alignment: 'left',
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    iconSize: 16,
    spacing: 'gap-2',
  },
  {
    id: 'bold-right',
    name: 'Bold Right',
    description: 'Strong map marker',
    icon: Map,
    alignment: 'right',
    fontSize: 'text-base',
    fontWeight: 'font-bold',
    iconSize: 24,
    spacing: 'gap-2',
    textTransform: 'uppercase',
    letterSpacing: 'tracking-wide',
  },
  {
    id: 'centered-top',
    name: 'Centered Top',
    description: 'Icon centered above text',
    icon: Target,
    alignment: 'top',
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    iconSize: 20,
    spacing: 'gap-2',
  },
  {
    id: 'modern-bottom',
    name: 'Modern Bottom',
    description: 'Icon below the venue text',
    icon: Navigation,
    alignment: 'bottom',
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    iconSize: 18,
    spacing: 'gap-1',
  }
];

export const getVenueStyleById = (styleId: string): VenueStyle | undefined => {
  return VENUE_STYLES.find(style => style.id === styleId);
};