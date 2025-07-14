
import { Template } from '@/types';

export const templates: Template[] = [
  {
    id: 'floral-elegant',
    name: 'Elegant Floral',
    category: 'floral',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    colors: {
      primary: '#d946ef',
      secondary: '#fdf2f8',
      accent: '#ec4899'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    }
  },
  {
    id: 'floral-garden',
    name: 'Garden Romance',
    category: 'floral',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    colors: {
      primary: '#059669',
      secondary: '#f0fdf4',
      accent: '#10b981'
    },
    fonts: {
      heading: 'Dancing Script',
      body: 'Source Sans Pro'
    }
  },
  {
    id: 'classic-timeless',
    name: 'Timeless Classic',
    category: 'classic',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    colors: {
      primary: '#1e40af',
      secondary: '#f8fafc',
      accent: '#3b82f6'
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Lato'
    }
  },
  {
    id: 'classic-vintage',
    name: 'Vintage Charm',
    category: 'classic',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    colors: {
      primary: '#a16207',
      secondary: '#fffbeb',
      accent: '#d97706'
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Open Sans'
    }
  },
  {
    id: 'modern-sleek',
    name: 'Modern Sleek',
    category: 'modern',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    colors: {
      primary: '#dc2626',
      secondary: '#fef2f2',
      accent: '#ef4444'
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Roboto'
    }
  },
  {
    id: 'modern-geometric',
    name: 'Geometric Modern',
    category: 'modern',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    colors: {
      primary: '#7c3aed',
      secondary: '#faf5ff',
      accent: '#8b5cf6'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Nunito Sans'
    }
  },
  {
    id: 'minimal-clean',
    name: 'Clean Minimal',
    category: 'minimal',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    colors: {
      primary: '#374151',
      secondary: '#f9fafb',
      accent: '#6b7280'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  },
  {
    id: 'minimal-nordic',
    name: 'Nordic Minimal',
    category: 'minimal',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    colors: {
      primary: '#0f172a',
      secondary: '#f1f5f9',
      accent: '#334155'
    },
    fonts: {
      heading: 'Work Sans',
      body: 'Work Sans'
    }
  }
];
