// File: hooks/useDynamicFontSizing.ts
import { useState, useCallback } from 'react';

interface FontSizeConfig {
  [elementId: string]: {
    baseFontSize: number;
    baseWidth: number;
    minFontSize: number;
    maxFontSize: number;
  };
}

const DEFAULT_FONT_CONFIG: FontSizeConfig = {
  brideName: {
    baseFontSize: 36,
    baseWidth: 200,
    minFontSize: 18,
    maxFontSize: 72
  },
  groomName: {
    baseFontSize: 36,
    baseWidth: 200,
    minFontSize: 18,
    maxFontSize: 72
  },
  weddingDate: {
    baseFontSize: 14,
    baseWidth: 180,
    minFontSize: 10,
    maxFontSize: 32
  },
  venue: {
    baseFontSize: 14,
    baseWidth: 160,
    minFontSize: 10,
    maxFontSize: 32
  },
  message: {
    baseFontSize: 16,
    baseWidth: 220,
    minFontSize: 12,
    maxFontSize: 36
  }
};

export const useDynamicFontSizing = (initialFontSizes: Record<string, number> = {}) => {
  const [elementFontSizes, setElementFontSizes] = useState<Record<string, number>>(() => ({
    brideName: 36,
    groomName: 36,
    weddingDate: 14,
    venue: 14,
    message: 16,
    ...initialFontSizes
  }));

  const calculateFontSizeFromWidth = useCallback((elementId: string, newWidth: number): number => {
    const config = DEFAULT_FONT_CONFIG[elementId];
    if (!config) return elementFontSizes[elementId] || 16;

    // Calculate scale ratio based on width change
    const scaleRatio = newWidth / config.baseWidth;
    
    // Apply scaling with smooth curve (using square root for smoother scaling)
    const smoothScale = Math.sqrt(scaleRatio);
    
    // Calculate new font size
    const newFontSize = config.baseFontSize * smoothScale;
    
    // Clamp to min/max values
    return Math.max(config.minFontSize, Math.min(config.maxFontSize, Math.round(newFontSize)));
  }, [elementFontSizes]);

const updateFontSizeFromResize = useCallback((elementId: string, newSize: { width: number; height: number }) => {
  const isTextElement = Object.keys(DEFAULT_FONT_CONFIG).includes(elementId);
  
  if (isTextElement) {
    const newFontSize = calculateFontSizeFromWidth(elementId, newSize.width);
    
    setElementFontSizes(prev => ({
      ...prev,
      [elementId]: newFontSize
    }));
    
    return newFontSize;
  }
  
  return elementFontSizes[elementId] || 16;
}, [calculateFontSizeFromWidth, elementFontSizes]);

  const setFontSize = useCallback((elementId: string, fontSize: number) => {
    setElementFontSizes(prev => ({
      ...prev,
      [elementId]: fontSize
    }));
  }, []);

  const getFontSize = useCallback((elementId: string): number => {
    return elementFontSizes[elementId] || DEFAULT_FONT_CONFIG[elementId]?.baseFontSize || 16;
  }, [elementFontSizes]);

  return {
    elementFontSizes,
    updateFontSizeFromResize,
    setFontSize,
    getFontSize,
    calculateFontSizeFromWidth
  };
};
