import { useCallback, useRef, useEffect } from 'react';

export interface TextMeasurementOptions {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  maxWidth?: number;
  padding?: { horizontal: number; vertical: number };
}

export interface TextDimensions {
  width: number;
  height: number;
}

export const useTextMeasurement = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas once
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      contextRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  const measureText = useCallback((
    text: string,
    options: TextMeasurementOptions = {}
  ): TextDimensions => {
    if (!contextRef.current || !text.trim()) {
      return { width: 100, height: 30 };
    }

    const {
      fontFamily = 'Inter, system-ui, sans-serif',
      fontSize = 16,
      fontWeight = '400',
      lineHeight = 1.4,
      maxWidth,
      padding = { horizontal: 16, vertical: 12 }
    } = options;

    const ctx = contextRef.current;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // If no maxWidth is specified, measure single line
    if (!maxWidth) {
      const metrics = ctx.measureText(text);
      return {
        width: Math.ceil(metrics.width) + padding.horizontal * 2,
        height: Math.ceil(fontSize * lineHeight) + padding.vertical * 2
      };
    }

    // Handle multi-line text with word wrapping
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxLineWidth = maxWidth - padding.horizontal * 2;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxLineWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is longer than maxWidth, force break
          lines.push(word);
          currentLine = '';
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    const lineCount = Math.max(1, lines.length);
    const totalHeight = Math.ceil(fontSize * lineHeight * lineCount) + padding.vertical * 2;

    // Calculate actual width based on longest line
    let maxActualWidth = 0;
    for (const line of lines) {
      const lineWidth = ctx.measureText(line).width;
      maxActualWidth = Math.max(maxActualWidth, lineWidth);
    }

    return {
      width: Math.ceil(Math.min(maxActualWidth + padding.horizontal * 2, maxWidth)),
      height: totalHeight
    };
  }, []);

  const measureElement = useCallback((element: HTMLElement): TextDimensions => {
    if (!element) return { width: 100, height: 30 };

    const computedStyle = window.getComputedStyle(element);
    const text = element.textContent || '';

    return measureText(text, {
      fontFamily: computedStyle.fontFamily,
      fontSize: parseFloat(computedStyle.fontSize),
      fontWeight: computedStyle.fontWeight,
      lineHeight: parseFloat(computedStyle.lineHeight) || 1.4,
      maxWidth: element.offsetWidth > 0 ? element.offsetWidth : undefined,
      padding: {
        horizontal: parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight),
        vertical: parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)
      }
    });
  }, [measureText]);

  return { measureText, measureElement };
};