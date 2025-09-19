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
  tolerance = 6, // Changed from 8 to 6 for tighter snapping
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
      
      // Canvas center guides - elements use center-based coordinates
      // Position 0,0 appears at the physical center of the container
      const canvasVerticalCenter = containerSize.width / 2;
      const canvasHorizontalCenter = containerSize.height / 2;
      
      guides.push({
        id: 'canvas-vertical-center',
        type: 'vertical',
        position: canvasVerticalCenter,
        isActive: isNearVerticalCenter,
        isCenter: true,
      });

      guides.push({
        id: 'canvas-horizontal-center',
        type: 'horizontal',
        position: canvasHorizontalCenter,
        isActive: isNearHorizontalCenter,
        isCenter: true,
      });

      // Element center alignment guides
      otherElements.forEach((element) => {
        if (element.id === elementId) return; // Skip the element being dragged

        const xDiff = Math.abs(currentPosition.x - element.position.x);
        const yDiff = Math.abs(currentPosition.y - element.position.y);

        // Show vertical alignment guide (element's X center)
        if (xDiff <= tolerance * 2 && !isNearVerticalCenter) {
          // Convert element's center-based position to screen pixels
          const guidePosition = canvasVerticalCenter + element.position.x;
          guides.push({
            id: `element-${element.id}-vertical`,
            type: 'vertical',
            position: guidePosition,
            isActive: xDiff <= tolerance,
            isCenter: false,
          });
        }

        // Show horizontal alignment guide (element's Y center)
        if (yDiff <= tolerance * 2 && !isNearHorizontalCenter) {
          // Convert element's center-based position to screen pixels
          const guidePosition = canvasHorizontalCenter + element.position.y;
          guides.push({
            id: `element-${element.id}-horizontal`,
            type: 'horizontal',
            position: guidePosition,
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