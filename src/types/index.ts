
export interface WeddingCardData {
  id?: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  message: string;
  templateId: string;
  createdAt?: string;
  updatedAt?: string;
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
}

export interface User {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  cardsCreated: number;
  maxCards: number;
}
