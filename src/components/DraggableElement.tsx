
import { useState, useRef, useEffect, ReactNode } from 'react';

interface DraggableElementProps {
  id: string;
  position: { x: number; y: number };
  onMove: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
  resizable?: boolean;
  size?: { width: number; height: number };
  onResize?: (size: { width: number; height: number }) => void;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
}

const DraggableElement = ({ 
  id, 
  position, 
  onMove, 
  containerRef, 
  children, 
  resizable = false,
  size = { width: 100, height: 100 },
  onResize,
  minSize = { width: 50, height: 50 },
  maxSize = { width: 300, height: 300 }
}: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const elementRef = useRef<HTMLDivElement>(null);

  const isPhotoElement = id.startsWith('photo') || id === 'photo';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isResizing) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (!containerRef.current) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setStartSize(size);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;

    if (isDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // Calculate new position relative to container center
      const newX = startPosition.x + deltaX;
      const newY = startPosition.y + deltaY;
      
      // Constrain to container bounds
      const maxX = containerRect.width / 2 - 50; // 50px margin
      const maxY = containerRect.height / 2 - 50;
      const minX = -containerRect.width / 2 + 50;
      const minY = -containerRect.height / 2 + 50;
      
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
      onMove({ x: constrainedX, y: constrainedY });
    } else if (isResizing && onResize) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      // Handle different resize directions
      switch (resizeDirection) {
        case 'se': // bottom-right
          newWidth = startSize.width + deltaX;
          newHeight = startSize.height + deltaY;
          break;
        case 'sw': // bottom-left
          newWidth = startSize.width - deltaX;
          newHeight = startSize.height + deltaY;
          break;
        case 'ne': // top-right
          newWidth = startSize.width + deltaX;
          newHeight = startSize.height - deltaY;
          break;
        case 'nw': // top-left
          newWidth = startSize.width - deltaX;
          newHeight = startSize.height - deltaY;
          break;
        case 'e': // right
          newWidth = startSize.width + deltaX;
          break;
        case 'w': // left
          newWidth = startSize.width - deltaX;
          break;
        case 'n': // top
          newHeight = startSize.height - deltaY;
          break;
        case 's': // bottom
          newHeight = startSize.height + deltaY;
          break;
      }
      
      // Apply constraints
      newWidth = Math.max(minSize.width, Math.min(maxSize.width, newWidth));
      newHeight = Math.max(minSize.height, Math.min(maxSize.height, newHeight));
      
      onResize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, startPosition, resizeStart, startSize, resizeDirection]);

  const resizeHandles = [
    { direction: 'nw', cursor: 'nw-resize', position: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'n', cursor: 'n-resize', position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'ne', cursor: 'ne-resize', position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'e', cursor: 'e-resize', position: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'se', cursor: 'se-resize', position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
    { direction: 's', cursor: 's-resize', position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { direction: 'sw', cursor: 'sw-resize', position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
    { direction: 'w', cursor: 'w-resize', position: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
  ];

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${isDragging || isResizing ? 'z-50' : 'z-10'} ${!isResizing ? 'cursor-move' : ''} group`}
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        left: '50%',
        top: '50%',
        width: resizable ? `${size.width}px` : 'auto',
        height: resizable ? `${size.height}px` : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className={`${isDragging || isResizing ? 'shadow-lg' : ''} transition-shadow relative ${
          isPhotoElement ? 'border-2 border-white group-hover:border-white' : ''
        }`}
        style={{
          border: isPhotoElement ? '2px solid white' : 'none',
          borderRadius: isPhotoElement ? '4px' : '0',
        }}
      >
        {children}
        
        {/* Resize handles for all corners and sides */}
        {resizable && (
          <>
            {resizeHandles.map((handle) => (
              <div
                key={handle.direction}
                className={`absolute w-3 h-3 bg-white border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity ${handle.position}`}
                style={{ cursor: handle.cursor }}
                onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DraggableElement;
