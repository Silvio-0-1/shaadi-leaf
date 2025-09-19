import { useState, useRef, useEffect, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PremiumDraggableElementProps {
  id: string;
  position: { x: number; y: number };
  onMove: (elementId: string, position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
  resizable?: boolean;
  size?: { width: number; height: number };
  onResize?: (elementId: string, size: { width: number; height: number }) => void;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  maintainAspectRatio?: boolean;
  isSelected?: boolean;
  onSelect?: (elementId: string | null) => void;
}

const PremiumDraggableElement = ({ 
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
  maintainAspectRatio = false,
  isSelected = false,
  onSelect
}: PremiumDraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const elementRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Calculate aspect ratio
  useEffect(() => {
    if (maintainAspectRatio && size.width && size.height) {
      setAspectRatio(size.width / size.height);
    }
  }, [size.width, size.height, maintainAspectRatio]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onSelect?.(id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isResizing) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setStartPosition(position);
    onSelect?.(id);
    
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
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isResizing) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (!containerRef.current) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setStartSize(size);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    if (isDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
      const newX = startPosition.x + deltaX;
      const newY = startPosition.y + deltaY;
      
      // Constrain to container bounds with padding
      const padding = 40;
      const maxX = containerRect.width / 2 - padding;
      const maxY = containerRect.height / 2 - padding;
      const minX = -containerRect.width / 2 + padding;
      const minY = -containerRect.height / 2 + padding;
      
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
      onMove(id, { x: constrainedX, y: constrainedY });
    } else if (isResizing && onResize) {
      const deltaX = clientX - resizeStart.x;
      const deltaY = clientY - resizeStart.y;
      
      let newWidth = startSize.width;
      let newHeight = startSize.height;
      
      switch (resizeDirection) {
        case 'se':
          newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width + deltaX));
          newHeight = maintainAspectRatio 
            ? newWidth / aspectRatio 
            : Math.max(minSize.height, Math.min(maxSize.height, startSize.height + deltaY));
          break;
        case 'sw':
          newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width - deltaX));
          newHeight = maintainAspectRatio 
            ? newWidth / aspectRatio 
            : Math.max(minSize.height, Math.min(maxSize.height, startSize.height + deltaY));
          break;
        case 'ne':
          newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width + deltaX));
          newHeight = maintainAspectRatio 
            ? newWidth / aspectRatio 
            : Math.max(minSize.height, Math.min(maxSize.height, startSize.height - deltaY));
          break;
        case 'nw':
          newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width - deltaX));
          newHeight = maintainAspectRatio 
            ? newWidth / aspectRatio 
            : Math.max(minSize.height, Math.min(maxSize.height, startSize.height - deltaY));
          break;
      }
      
      // Apply final constraints
      newWidth = Math.max(minSize.width, Math.min(maxSize.width, newWidth));
      newHeight = Math.max(minSize.height, Math.min(maxSize.height, newHeight));
      
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
      
      onResize(id, { width: newWidth, height: newHeight });
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
    e.preventDefault(); // Prevent scrolling
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchend', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, startPosition, resizeStart, startSize, resizeDirection, aspectRatio]);

  // Handle global clicks to deselect
  useEffect(() => {
    const handleGlobalClick = () => {
      if (isSelected && !isDragging && !isResizing) {
        onSelect?.(null);
      }
    };

    if (isSelected) {
      document.addEventListener('click', handleGlobalClick);
      return () => document.removeEventListener('click', handleGlobalClick);
    }
  }, [isSelected, isDragging, isResizing, onSelect]);

  const resizeHandles = [
    { direction: 'nw', cursor: 'nw-resize', position: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'ne', cursor: 'ne-resize', position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'se', cursor: 'se-resize', position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
    { direction: 'sw', cursor: 'sw-resize', position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
  ];

  return (
    <div
      ref={elementRef}
      className={`absolute select-none transition-all duration-200 ${
        isDragging || isResizing ? 'z-50 scale-105' : isSelected ? 'z-40' : 'z-10'
      } ${!isResizing ? 'cursor-move' : ''} group`}
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        left: '50%',
        top: '50%',
        width: resizable ? `${size.width}px` : 'auto',
        height: resizable ? `${size.height}px` : 'auto',
        touchAction: 'none', // Prevent default touch behaviors
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <div 
        className={`relative w-full h-full transition-all duration-200 ${
          isDragging || isResizing ? 'shadow-2xl' : isSelected ? 'shadow-lg' : ''
        } ${isSelected ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-white/50' : ''} rounded-sm`}
      >
        {children}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute -inset-2 border-2 border-primary/40 rounded-md bg-primary/5 pointer-events-none animate-pulse" />
        )}
        
        {/* Resize handles */}
        {resizable && isSelected && (
          <>
            {resizeHandles.map((handle) => (
              <div
                key={handle.direction}
                className={`absolute ${isMobile ? 'w-6 h-6' : 'w-4 h-4'} bg-primary border-2 border-white rounded-full shadow-lg opacity-90 hover:opacity-100 hover:scale-125 transition-all duration-200 ${handle.position}`}
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

export default PremiumDraggableElement;