
export interface WeddingCardData {
  id?: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  message: string;
  templateId: string;
  uploadedImage?: string;
  uploadedImages?: string[]; // Support multiple images
  logoImage?: string; // Custom logo/monogram
  customization?: TemplateCustomization;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateCustomization {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
    date?: string;
    venue?: string;
    message?: string;
  };
  fontSizes?: {
    headingSize?: number;
    bodySize?: number;
    dateSize?: number;
    venueSize?: number;
    messageSize?: number;
  };
  textColors?: {
    brideName?: string;
    groomName?: string;
    date?: string;
    venue?: string;
    message?: string;
  };
  backgroundPattern?: string;
  layout?: string;
  photoShape?: 'square' | 'circle' | 'rounded';
}

export interface ElementPosition {
  x: number;
  y: number;
}

export interface PhotoElement {
  position: ElementPosition;
  size: { width: number; height: number };
  rotation?: number;
  isLocked?: boolean;
}

export interface IndividualPhotoElement {
  position: ElementPosition;
  size: { width: number; height: number };
  id: string;
  rotation?: number;
  isLocked?: boolean;
}

export interface CardElements {
  brideName: ElementPosition;
  groomName: ElementPosition;
  heartIcon: ElementPosition;
  weddingDate: ElementPosition;
  venue: ElementPosition;
  message: ElementPosition;
  photo: PhotoElement;
  photos?: IndividualPhotoElement[]; // New field for individual photo control
  logo: ElementPosition;
}

export interface Template {
  id: string;
  name: string;
  category: 'floral' | 'classic' | 'modern' | 'minimal' | 'custom';
  thumbnail: string;
  isPremium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layouts?: string[]; // Available layout variations
  supportsMultiPhoto?: boolean;
  supportsVideo?: boolean;
  backgroundImage?: string; // Custom background image for template
  defaultPositions?: CardElements; // Predefined positions for elements
  tags?: string[]; // Template tags (for custom templates)
}

export interface VideoCardData extends WeddingCardData {
  videoSettings?: {
    duration: number;
    musicTrack?: string;
    transitions: string[];
    animationStyle: string;
  };
}

export interface User {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  cardsCreated: number;
  maxCards: number;
}

export type { ResizeHandle } from './editor';
export type { 
  TextBorderStyle, 
  TextBorderConfiguration, 
  TextBorderPreset,
  TextBorderGradient,
  TextBorderShadow 
} from './textBorder';
