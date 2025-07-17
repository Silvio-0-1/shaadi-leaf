
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
    },
    layouts: ['classic', 'split', 'modern'],
    supportsMultiPhoto: true,
    supportsVideo: false
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
    },
    layouts: ['classic', 'split', 'modern', 'collage'],
    supportsMultiPhoto: true,
    supportsVideo: true
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
    },
    layouts: ['classic', 'split'],
    supportsMultiPhoto: true,
    supportsVideo: false
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
    },
    layouts: ['classic', 'split', 'modern', 'collage'],
    supportsMultiPhoto: true,
    supportsVideo: true
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
    },
    layouts: ['modern', 'split'],
    supportsMultiPhoto: true,
    supportsVideo: false
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
    },
    layouts: ['classic', 'split', 'modern', 'collage'],
    supportsMultiPhoto: true,
    supportsVideo: true
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
    },
    layouts: ['classic', 'modern'],
    supportsMultiPhoto: false,
    supportsVideo: false
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
    },
    layouts: ['classic', 'split', 'modern'],
    supportsMultiPhoto: true,
    supportsVideo: true
  },
  // Custom template examples
  {
    id: 'custom-invitation-1',
    name: 'Royal Invitation',
    category: 'custom',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    colors: {
      primary: '#8b5cf6',
      secondary: '#faf5ff',
      accent: '#a78bfa'
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter'
    },
    layouts: ['custom'],
    supportsMultiPhoto: true,
    supportsVideo: true,
    backgroundImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=1000&fit=crop',
    defaultPositions: {
      brideName: { x: -50, y: -60 },
      groomName: { x: 50, y: 60 },
      heartIcon: { x: 0, y: 0 },
      weddingDate: { x: 0, y: 120 },
      venue: { x: 0, y: 150 },
      message: { x: 0, y: 200 },
      photo: { x: -100, y: -100 },
      logo: { x: 100, y: -150 },
    }
  },
  {
    id: 'custom-invitation-2',
    name: 'Garden Party',
    category: 'custom',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    colors: {
      primary: '#16a34a',
      secondary: '#f0fdf4',
      accent: '#22c55e'
    },
    fonts: {
      heading: 'Dancing Script',
      body: 'Inter'
    },
    layouts: ['custom'],
    supportsMultiPhoto: true,
    supportsVideo: false,
    backgroundImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=1000&fit=crop',
    defaultPositions: {
      brideName: { x: 0, y: -80 },
      groomName: { x: 0, y: -40 },
      heartIcon: { x: 0, y: -10 },
      weddingDate: { x: 0, y: 80 },
      venue: { x: 0, y: 110 },
      message: { x: 0, y: 150 },
      photo: { x: 0, y: -140 },
      logo: { x: 0, y: -180 },
    }
  }
];
