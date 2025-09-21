import React from 'react';
import { ElementPosition } from '@/types';

interface SelectionHandle {
  id: string;
  x: number;
  y: number;
  cursor: string;
  className: string;
}

interface SelectionOverlayProps {
  selectedElementId: string | null;
  elementPosition: ElementPosition;
  elementSize: { width: number; height: number };
  containerSize: { width: number; height: number };
  onResizeStart: (direction: string, event: React.MouseEvent) => void;
  onRotateStart: (event: React.MouseEvent) => void;
  showResizeHandles?: boolean;
  showRotateHandle?: boolean;
}

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  selectedElementId,
  elementPosition,
  elementSize,
  containerSize,
  onResizeStart,
  onRotateStart,
  showResizeHandles = true,
  showRotateHandle = true,
}) => {
  if (!selectedElementId) return null;

  // Convert element position to absolute screen coordinates
  const centerX = containerSize.width / 2;
  const centerY = containerSize.height / 2;
  const absoluteX = centerX + elementPosition.x - elementSize.width / 2;
  const absoluteY = centerY + elementPosition.y - elementSize.height / 2;

  // Selection handles for resizing
  const resizeHandles: SelectionHandle[] = [
    { id: 'nw', x: -4, y: -4, cursor: 'nw-resize', className: 'top-0 left-0' },
    { id: 'n', x: elementSize.width / 2 - 4, y: -4, cursor: 'n-resize', className: 'top-0 left-1/2 -translate-x-1/2' },
    { id: 'ne', x: elementSize.width - 4, y: -4, cursor: 'ne-resize', className: 'top-0 right-0' },
    { id: 'e', x: elementSize.width - 4, y: elementSize.height / 2 - 4, cursor: 'e-resize', className: 'top-1/2 right-0 -translate-y-1/2' },
    { id: 'se', x: elementSize.width - 4, y: elementSize.height - 4, cursor: 'se-resize', className: 'bottom-0 right-0' },
    { id: 's', x: elementSize.width / 2 - 4, y: elementSize.height - 4, cursor: 's-resize', className: 'bottom-0 left-1/2 -translate-x-1/2' },
    { id: 'sw', x: -4, y: elementSize.height - 4, cursor: 'sw-resize', className: 'bottom-0 left-0' },
    { id: 'w', x: -4, y: elementSize.height / 2 - 4, cursor: 'w-resize', className: 'top-1/2 left-0 -translate-y-1/2' },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50"
      style={{ zIndex: 1000 }}
    >
      {/* Selection bounding box */}
      <div
        className="absolute border-2 border-primary pointer-events-none"
        style={{
          left: absoluteX,
          top: absoluteY,
          width: elementSize.width,
          height: elementSize.height,
          transform: 'none',
        }}
      >
        {/* Resize handles */}
        {showResizeHandles && resizeHandles.map((handle) => (
          <div
            key={handle.id}
            className={`absolute w-2 h-2 bg-blue-500 border border-white pointer-events-auto ${handle.className}`}
            style={{
              cursor: handle.cursor,
              left: handle.id.includes('w') ? -4 : handle.id.includes('e') ? undefined : handle.x,
              right: handle.id.includes('e') ? -4 : undefined,
              top: handle.id.includes('n') ? -4 : handle.id.includes('s') ? undefined : handle.y,
              bottom: handle.id.includes('s') ? -4 : undefined,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart(handle.id, e);
            }}
          />
        ))}

        {/* Rotation handle */}
        {showRotateHandle && (
          <div
            className="absolute w-3 h-3 bg-green-500 border border-white rounded-full pointer-events-auto cursor-grab active:cursor-grabbing"
            style={{
              left: elementSize.width / 2 - 6,
              top: -20,
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onRotateStart(e);
            }}
          >
            <div className="absolute w-px h-3 bg-green-500 left-1/2 top-3 -translate-x-1/2" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionOverlay;