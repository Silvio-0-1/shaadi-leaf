
import { Template } from '../types';

export const templates: Template[] = [
  {
    id: 'floral-elegance',
    name: 'Floral Elegance',
    category: 'floral',
    thumbnail: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=600&fit=crop',
    isPremium: false,
    colors: {
      primary: '#ec4899',
      secondary: '#fdf2f8',
      accent: '#f59e0b'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    }
  },
  {
    id: 'classic-romance',
    name: 'Classic Romance',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=600&fit=crop',
    isPremium: false,
    colors: {
      primary: '#be185d',
      secondary: '#fef3c7',
      accent: '#d97706'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    }
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    category: 'modern',
    thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=600&fit=crop',
    isPremium: false,
    colors: {
      primary: '#1f2937',
      secondary: '#f9fafb',
      accent: '#f59e0b'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  {
    id: 'golden-luxury',
    name: 'Golden Luxury',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=600&fit=crop',
    isPremium: true,
    colors: {
      primary: '#b45309',
      secondary: '#fffbeb',
      accent: '#ec4899'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    }
  }
];
