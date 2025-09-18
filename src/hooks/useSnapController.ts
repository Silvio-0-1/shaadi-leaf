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
}

export const useSnapController = ({
  enabled,
  tolerance = 8,
  containerSize,
  otherElements = [],
}: UseSnapControllerProps) => {
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [snapTooltip, setSnapTooltip] = useState<{ message: string; x: number; y: number } | null>(null);

  // Simplified snap calculation - only 4 cases
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

    // Case 1 & 2: Snap to canvas center (horizontal and vertical)
    if (Math.abs(currentPosition.x) <= tolerance) {
      newPosition.x = 0;
      snappedToCenter.vertical = true;
      snapMessage = 'Vertical center';
    }

    if (Math.abs(currentPosition.y) <= tolerance) {
      newPosition.y = 0;
      snappedToCenter.horizontal = true;
      if (snapMessage) snapMessage += ' + ';
      snapMessage += 'Horizontal center';
    }

    // Case 3 & 4: Snap to other element centers (only if not already snapped to canvas center)
    if (!snappedToCenter.vertical || !snappedToCenter.horizontal) {
      otherElements.forEach((element) => {
        if (element.id === elementId) return;

        // Case 3: Horizontal alignment (same vertical position)
        const yDiff = Math.abs(currentPosition.y - element.position.y);
        if (yDiff <= tolerance && !snappedToCenter.horizontal) {
          newPosition.y = element.position.y;
          if (snapMessage) snapMessage += ' + ';
          snapMessage += 'Element center (horizontal)';
        }

        // Case 4: Vertical alignment (same horizontal position)  
        const xDiff = Math.abs(currentPosition.x - element.position.x);
        if (xDiff <= tolerance && !snappedToCenter.vertical) {
          newPosition.x = element.position.x;
          if (snapMessage) snapMessage += ' + ';
          snapMessage += 'Element center (vertical)';
        }
      });
    }

    return {
      position: newPosition,
      snappedToCenter,
      snapMessage: snapMessage || undefined,
    };
  }, [enabled, tolerance, otherElements]);


  // Update guides based on current drag state - simplified to only show 4 cases
  const updateGuides = useCallback((
    elementId: string,
    currentPosition: ElementPosition,
    elementSize: { width: number; height: number },
    isDragging: boolean
  ) => {
    let guides: SnapGuide[] = [];
    let tooltip: { message: string; x: number; y: number } | null = null;

    if (enabled && isDragging) {
      const isNearVerticalCenter = Math.abs(currentPosition.x) <= tolerance;
      const isNearHorizontalCenter = Math.abs(currentPosition.y) <= tolerance;
      
      // Always show canvas center guides when dragging
      guides.push({
        id: 'center-vertical',
        type: 'vertical',
        position: 0,
        isActive: isNearVerticalCenter,
        isCenter: true,
      });

      guides.push({
        id: 'center-horizontal',
        type: 'horizontal',
        position: 0,
        isActive: isNearHorizontalCenter,
        isCenter: true,
      });

      // Show element center alignment guides only if not snapping to canvas center
      const centerX = containerSize.width / 2;
      const centerY = containerSize.height / 2;
      
      otherElements.forEach((element, index) => {
        if (element.id === elementId) return;

        const xDiff = Math.abs(currentPosition.x - element.position.x);
        const yDiff = Math.abs(currentPosition.y - element.position.y);

        // Show vertical alignment guide (same X position) if close and not snapping to canvas center
        if (xDiff <= tolerance * 2 && !isNearVerticalCenter) {
          guides.push({
            id: `element-${index}-vertical`,
            type: 'vertical',
            position: centerX + element.position.x,
            isActive: xDiff <= tolerance,
            isCenter: false,
          });
        }

        // Show horizontal alignment guide (same Y position) if close and not snapping to canvas center
        if (yDiff <= tolerance * 2 && !isNearHorizontalCenter) {
          guides.push({
            id: `element-${index}-horizontal`,
            type: 'horizontal',
            position: centerY + element.position.y,
            isActive: yDiff <= tolerance,
            isCenter: false,
          });
        }
      });

      // Show tooltip when snapping is active
      const snapResult = calculateSnap(elementId, currentPosition, elementSize);
      if (snapResult.snapMessage) {
        tooltip = {
          message: snapResult.snapMessage,
          x: 0,
          y: 0,
        };
      }
    }

    setSnapGuides(guides);
    setSnapTooltip(tooltip);
  }, [enabled, tolerance, containerSize, otherElements, calculateSnap]);

  // Clear guides and tooltip
  const clearGuides = useCallback(() => {
    setSnapGuides([]);
    setSnapTooltip(null);
  }, []);

  return {
    snapGuides,
    snapTooltip,
    calculateSnap,
    updateGuides,
    clearGuides,
  };
};