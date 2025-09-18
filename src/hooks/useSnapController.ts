import { useState, useCallback, useRef } from 'react';
import { ElementPosition } from '@/types';
import { SnapGuide } from '@/components/SnapGuides';

interface SnapResult {
  position: ElementPosition;
  snappedToCenter: { horizontal: boolean; vertical: boolean };
  snapMessage?: string;
}

interface UseSnapControllerProps {
  enabled: boolean;
  tolerance: number;
  containerSize: { width: number; height: number };
  otherElements?: Array<{ id: string; position: ElementPosition; size?: { width: number; height: number } }>;
  onSnap?: (message: string) => void;
}

export const useSnapController = ({
  enabled,
  tolerance = 8,
  containerSize,
  otherElements = [],
  onSnap,
}: UseSnapControllerProps) => {
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [snapTooltip, setSnapTooltip] = useState<{ message: string; x: number; y: number } | null>(null);
  const lastSnapTime = useRef<number>(0);

  // Generate static guides (always visible when enabled)
  const generateStaticGuides = useCallback((): SnapGuide[] => {
    if (!enabled) return [];

    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;

    return [
      {
        id: 'center-vertical',
        type: 'vertical' as const,
        position: centerX,
        isActive: false,
        isCenter: true,
      },
      {
        id: 'center-horizontal',
        type: 'horizontal' as const,
        position: centerY,
        isActive: false,
        isCenter: true,
      },
    ];
  }, [enabled, containerSize]);

  // Calculate snap position and active guides
  const calculateSnap = useCallback((
    elementId: string,
    currentPosition: ElementPosition,
    elementSize: { width: number; height: number }
  ): SnapResult => {
    if (!enabled) {
      return {
        position: currentPosition,
        snappedToCenter: { horizontal: false, vertical: false },
      };
    }

    let newPosition = { ...currentPosition };
    let snappedToCenter = { horizontal: false, vertical: false };
    let snapMessage = '';

    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;

    // Check snap to center lines
    if (Math.abs(currentPosition.x) <= tolerance) {
      newPosition.x = 0;
      snappedToCenter.vertical = true;
      snapMessage += 'Vertical center';
    }

    if (Math.abs(currentPosition.y) <= tolerance) {
      newPosition.y = 0;
      snappedToCenter.horizontal = true;
      if (snapMessage) snapMessage += ' + ';
      snapMessage += 'Horizontal center';
    }

    // Check snap to other elements
    otherElements.forEach((element) => {
      if (element.id === elementId) return;

      const xDiff = Math.abs(currentPosition.x - element.position.x);
      const yDiff = Math.abs(currentPosition.y - element.position.y);

      if (xDiff <= tolerance && !snappedToCenter.vertical) {
        newPosition.x = element.position.x;
        if (snapMessage) snapMessage += ' + ';
        snapMessage += 'Aligned horizontally';
      }

      if (yDiff <= tolerance && !snappedToCenter.horizontal) {
        newPosition.y = element.position.y;
        if (snapMessage) snapMessage += ' + ';
        snapMessage += 'Aligned vertically';
      }
    });

    // Add subtle easing animation for snapping
    if (newPosition.x !== currentPosition.x || newPosition.y !== currentPosition.y) {
      const now = Date.now();
      if (now - lastSnapTime.current > 100) { // Prevent spam
        lastSnapTime.current = now;
        if (snapMessage && onSnap) {
          onSnap(snapMessage);
        }
      }
    }

    return {
      position: newPosition,
      snappedToCenter,
      snapMessage: snapMessage || undefined,
    };
  }, [enabled, tolerance, containerSize, otherElements, onSnap]);

  // Update guides based on current drag state
  const updateGuides = useCallback((
    elementId: string,
    currentPosition: ElementPosition,
    elementSize: { width: number; height: number },
    isDragging: boolean
  ) => {
    let guides: SnapGuide[] = [];
    let tooltip: { message: string; x: number; y: number } | null = null;

    if (enabled) {
      // Always show center guides when enabled and dragging
      if (isDragging) {
        // Use simplified positioning - just mark as center guides
        guides.push({
          id: 'center-vertical',
          type: 'vertical',
          position: 0, // Will be positioned at 50% in CSS
          isActive: Math.abs(currentPosition.x) <= tolerance,
          isCenter: true,
        });

        guides.push({
          id: 'center-horizontal',
          type: 'horizontal',
          position: 0, // Will be positioned at 50% in CSS
          isActive: Math.abs(currentPosition.y) <= tolerance,
          isCenter: true,
        });

        // Add guides for other elements when dragging
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        
        otherElements.forEach((element, index) => {
          if (element.id === elementId) return;

          const xDiff = Math.abs(currentPosition.x - element.position.x);
          const yDiff = Math.abs(currentPosition.y - element.position.y);

          if (xDiff <= tolerance * 3) {
            guides.push({
              id: `element-${index}-vertical`,
              type: 'vertical',
              position: centerX + element.position.x,
              isActive: xDiff <= tolerance,
              isCenter: false,
            });
          }

          if (yDiff <= tolerance * 3) {
            guides.push({
              id: `element-${index}-horizontal`,
              type: 'horizontal',
              position: centerY + element.position.y,
              isActive: yDiff <= tolerance,
              isCenter: false,
            });
          }
        });

        // Show tooltip when snapping
        const snapResult = calculateSnap(elementId, currentPosition, elementSize);
        if (snapResult.snapMessage) {
          tooltip = {
            message: snapResult.snapMessage,
            x: 0, // Will be positioned at center in CSS
            y: 0,
          };
        }
      }
    }

    setSnapGuides(guides);
    setSnapTooltip(tooltip);
  }, [enabled, tolerance, containerSize, otherElements, calculateSnap]);

  // Clear guides and tooltip
  const clearGuides = useCallback(() => {
    setSnapGuides(generateStaticGuides());
    setSnapTooltip(null);
  }, [generateStaticGuides]);

  // Debug logging
  const logSnapEvent = useCallback((event: string, data: any) => {
    console.log(`🎯 SNAP [${event}]:`, data);
  }, []);

  return {
    snapGuides,
    snapTooltip,
    calculateSnap,
    updateGuides,
    clearGuides,
    logSnapEvent,
  };
};