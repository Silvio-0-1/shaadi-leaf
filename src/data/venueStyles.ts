import { 
  MapPin, 
  Navigation, 
  Compass, 
  Locate, 
  Map, 
  Target,
  MapPinned,
  Milestone,
  Home,
  Building,
  Building2,
  Church,
  Hotel,
  Tent,
  Trees,
  Mountain,
  Palmtree,
  Flower2,
  Heart,
  Star,
  Sparkles,
  Diamond,
  Crown,
  Award
} from 'lucide-react';

export interface VenueStyle {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  iconSize: number;
}

export const VENUE_STYLES: VenueStyle[] = [
  {
    id: 'map-pin',
    name: 'Map Pin',
    description: 'Classic location marker',
    icon: MapPin,
    iconSize: 20,
  },
  {
    id: 'map-pinned',
    name: 'Pinned Location',
    description: 'Filled location pin',
    icon: MapPinned,
    iconSize: 20,
  },
  {
    id: 'compass',
    name: 'Compass',
    description: 'Elegant directional compass',
    icon: Compass,
    iconSize: 22,
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Modern navigation arrow',
    icon: Navigation,
    iconSize: 20,
  },
  {
    id: 'target',
    name: 'Target',
    description: 'Precise location target',
    icon: Target,
    iconSize: 20,
  },
  {
    id: 'milestone',
    name: 'Milestone',
    description: 'Journey marker',
    icon: Milestone,
    iconSize: 20,
  },
  {
    id: 'map',
    name: 'Map',
    description: 'Traditional map icon',
    icon: Map,
    iconSize: 20,
  },
  {
    id: 'locate',
    name: 'Locate',
    description: 'Minimal location dot',
    icon: Locate,
    iconSize: 18,
  },
  {
    id: 'home',
    name: 'Home',
    description: 'Cozy home venue',
    icon: Home,
    iconSize: 20,
  },
  {
    id: 'building',
    name: 'Building',
    description: 'Modern building',
    icon: Building,
    iconSize: 20,
  },
  {
    id: 'building-classic',
    name: 'Classic Building',
    description: 'Traditional venue building',
    icon: Building2,
    iconSize: 20,
  },
  {
    id: 'church',
    name: 'Church',
    description: 'Sacred ceremony venue',
    icon: Church,
    iconSize: 22,
  },
  {
    id: 'hotel',
    name: 'Hotel',
    description: 'Luxury hotel venue',
    icon: Hotel,
    iconSize: 20,
  },
  {
    id: 'tent',
    name: 'Tent',
    description: 'Outdoor tent celebration',
    icon: Tent,
    iconSize: 20,
  },
  {
    id: 'trees',
    name: 'Forest',
    description: 'Natural woodland setting',
    icon: Trees,
    iconSize: 22,
  },
  {
    id: 'mountain',
    name: 'Mountain',
    description: 'Mountain vista venue',
    icon: Mountain,
    iconSize: 22,
  },
  {
    id: 'palmtree',
    name: 'Beach',
    description: 'Tropical beach location',
    icon: Palmtree,
    iconSize: 22,
  },
  {
    id: 'flower',
    name: 'Garden',
    description: 'Blooming garden venue',
    icon: Flower2,
    iconSize: 20,
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'Romantic heart symbol',
    icon: Heart,
    iconSize: 20,
  },
  {
    id: 'star',
    name: 'Star',
    description: 'Starlit celebration',
    icon: Star,
    iconSize: 20,
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    description: 'Magical celebration',
    icon: Sparkles,
    iconSize: 20,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    description: 'Luxury diamond icon',
    icon: Diamond,
    iconSize: 20,
  },
  {
    id: 'crown',
    name: 'Crown',
    description: 'Royal celebration',
    icon: Crown,
    iconSize: 22,
  },
  {
    id: 'award',
    name: 'Award',
    description: 'Special occasion marker',
    icon: Award,
    iconSize: 20,
  },
];

export const getVenueStyleById = (styleId: string): VenueStyle | undefined => {
  return VENUE_STYLES.find(style => style.id === styleId);
};