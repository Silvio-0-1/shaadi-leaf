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
  Castle,
  Warehouse,
  Store,
  TreePine,
  Trees,
  Mountain,
  Waves,
  Palmtree,
  Flower2,
  PartyPopper,
  Wine,
  Utensils
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
    id: 'castle',
    name: 'Castle',
    description: 'Royal castle venue',
    icon: Castle,
    iconSize: 22,
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Industrial venue space',
    icon: Warehouse,
    iconSize: 20,
  },
  {
    id: 'store',
    name: 'Venue Hall',
    description: 'Event hall or store',
    icon: Store,
    iconSize: 20,
  },
  {
    id: 'tree-pine',
    name: 'Pine Forest',
    description: 'Pine tree venue',
    icon: TreePine,
    iconSize: 22,
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
    id: 'waves',
    name: 'Waterfront',
    description: 'Seaside location',
    icon: Waves,
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
    id: 'party',
    name: 'Party Venue',
    description: 'Celebration space',
    icon: PartyPopper,
    iconSize: 20,
  },
  {
    id: 'winery',
    name: 'Winery',
    description: 'Vineyard or winery venue',
    icon: Wine,
    iconSize: 20,
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Dining venue',
    icon: Utensils,
    iconSize: 20,
  },
];

export const getVenueStyleById = (styleId: string): VenueStyle | undefined => {
  return VENUE_STYLES.find(style => style.id === styleId);
};