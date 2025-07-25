
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
  maintainAspectRatio?: boolean;
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
  maxSize = { width: 300, height: 300 },
  maintainAspectRatio = false
}: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const elementRef = useRef<HTMLDivElement>(null);

  const isPhotoElement = id.startsWith('photo') || id === 'photo';

  // Calculate initial aspect ratio
  useEffect(() => {
    if (maintainAspectRatio && size.width && size.height) {
      setAspectRatio(size.width / size.height);
    }
  }, [size.width, size.height, maintainAspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isResizing) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isResizing) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
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

  const handleResizeTouchStart = (e: React.TouchEvent, direction: string) => {
    if (!containerRef.current) return;
    
    const touch = e.touches[0];
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: touch.clientX, y: touch.clientY });
    setStartSize(size);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    if (isDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
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
      const deltaX = clientX - resizeStart.x;
      const deltaY = clientY - resizeStart.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      // Handle different resize directions
      switch (resizeDirection) {
        case 'se': // bottom-right
          newWidth = Math.max(minSize.width, startSize.width + deltaX);
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.max(minSize.height, startSize.height + deltaY);
          }
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(minSize.width, startSize.width - deltaX);
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.max(minSize.height, startSize.height + deltaY);
          }
          break;
        case 'ne': // top-right
          newWidth = Math.max(minSize.width, startSize.width + deltaX);
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.max(minSize.height, startSize.height - deltaY);
          }
          break;
        case 'nw': // top-left
          newWidth = Math.max(minSize.width, startSize.width - deltaX);
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          } else {
            newHeight = Math.max(minSize.height, startSize.height - deltaY);
          }
          break;
        case 'e': // right
          newWidth = Math.max(minSize.width, startSize.width + deltaX);
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          }
          break;
        case 'w': // left
          newWidth = Math.max(minSize.width, startSize.width - deltaX);
          if (maintainAspectRatio) {
            newHeight = newWidth / aspectRatio;
          }
          break;
        case 'n': // top
          newHeight = Math.max(minSize.height, startSize.height - deltaY);
          if (maintainAspectRatio) {
            newWidth = newHeight * aspectRatio;
          }
          break;
        case 's': // bottom
          newHeight = Math.max(minSize.height, startSize.height + deltaY);
          if (maintainAspectRatio) {
            newWidth = newHeight * aspectRatio;
          }
          break;
      }
      
      // Apply max constraints
      newWidth = Math.min(maxSize.width, newWidth);
      newHeight = Math.min(maxSize.height, newHeight);
      
      // Maintain aspect ratio if needed
      if (maintainAspectRatio) {
        if (newWidth / aspectRatio > maxSize.height) {
          newWidth = maxSize.height * aspectRatio;
          newHeight = maxSize.height;
        } else if (newHeight * aspectRatio > maxSize.width) {
          newHeight = maxSize.width / aspectRatio;
          newWidth = maxSize.width;
        } else {
          newHeight = newWidth / aspectRatio;
        }
      }
      
      onResize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
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
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, startPosition, resizeStart, startSize, resizeDirection, aspectRatio]);

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
      onTouchStart={handleTouchStart}
    >
      <div 
        className={`${isDragging || isResizing ? 'shadow-lg' : ''} transition-shadow relative w-full h-full`}
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
                onTouchStart={(e) => handleResizeTouchStart(e, handle.direction)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default DraggableElement;
