
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
  };
  backgroundPattern?: string;
  layout?: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'floral' | 'classic' | 'modern' | 'minimal';
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
