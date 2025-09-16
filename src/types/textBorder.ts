// Text border framework types
export interface TextBorderStyle {
  type: 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient' | 'glow' | 'shadow' | 'outline';
  width: number;
  color: string;
  opacity: number;
  radius: number;
  animation?: 'none' | 'pulse' | 'glow' | 'shimmer';
}

export interface TextBorderGradient {
  colors: string[];
  direction: number; // degrees
  stops?: number[];
}

export interface TextBorderShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  inset?: boolean;
}

export interface TextBorderConfiguration {
  enabled: boolean;
  style: TextBorderStyle;
  gradient?: TextBorderGradient;
  shadow?: TextBorderShadow;
  customCSS?: string;
}

export interface TextBorderPreset {
  id: string;
  name: string;
  description: string;
  config: TextBorderConfiguration;
}

export const DEFAULT_TEXT_BORDER_PRESETS: TextBorderPreset[] = [
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Subtle solid border with soft corners',
    config: {
      enabled: true,
      style: {
        type: 'solid',
        width: 1,
        color: '#e2e8f0',
        opacity: 0.8,
        radius: 4,
        animation: 'none'
      }
    }
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Gradient border with glow effect',
    config: {
      enabled: true,
      style: {
        type: 'gradient',
        width: 2,
        color: '#3b82f6',
        opacity: 1,
        radius: 8,
        animation: 'glow'
      },
      gradient: {
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
        direction: 45
      }
    }
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Double border with subtle shadow',
    config: {
      enabled: true,
      style: {
        type: 'double',
        width: 3,
        color: '#374151',
        opacity: 0.7,
        radius: 2,
        animation: 'none'
      },
      shadow: {
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: '#00000020'
      }
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Animated glowing outline',
    config: {
      enabled: true,
      style: {
        type: 'glow',
        width: 2,
        color: '#f59e0b',
        opacity: 0.9,
        radius: 12,
        animation: 'pulse'
      }
    }
  }
];