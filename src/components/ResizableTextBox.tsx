import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition, TemplateCustomization } from '@/types';

interface ResizableTextBoxProps {
  id: string;
  position: ElementPosition;
  onMove: (elementId: string, position: ElementPosition) => void;
  onResize?: (elementId: string, size: { width: number; height: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  isSelected?: boolean;
  onSelect?: (elementId: string | null) => void;
  customization?: TemplateCustomization;
  className?: string;
  rotation?: number;
  onRotate?: (elementId: string, rotation: number) => void;
}

const ResizableTextBox = ({ 
  id, 
  position, 
  onMove, 
  onResize,
  containerRef, 
  children, 
  width = 200,
  height = 60,
  minWidth = 120,
  maxWidth = 800,
  minHeight = 50,
  maxHeight = 400,
  isSelected = false,
  onSelect,
  customization,
  className = '',
  rotation = 0,
  onRotate
}: ResizableTextBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, rotation: 0 });
  
  // Real-time size state for smooth preview
  const [currentSize, setCurrentSize] = useState({ width, height });
  const [currentRotation, setCurrentRotation] = useState(rotation);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>();
  const isMobile = useIsMobile();

  // Update current size and rotation when props change
  useEffect(() => {
    setCurrentSize({ width, height });
    setCurrentRotation(rotation);
  }, [width, height, rotation]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onSelect?.(id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isResizing || isRotating) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isResizing || isRotating) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
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
    setStartSize(currentSize);
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
    setStartSize(currentSize);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRotationMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !elementRef.current) return;
    
    setIsRotating(true);
    setRotationStart({ 
      x: e.clientX, 
      y: e.clientY, 
      rotation: currentRotation 
    });
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRotationTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || !elementRef.current) return;
    
    const touch = e.touches[0];
    setIsRotating(true);
    setRotationStart({ 
      x: touch.clientX, 
      y: touch.clientY, 
      rotation: currentRotation 
    });
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const calculateNewSize = useCallback((clientX: number, clientY: number) => {
    const deltaX = clientX - resizeStart.x;
    const deltaY = clientY - resizeStart.y;
    
    let newWidth = startSize.width;
    let newHeight = startSize.height;
    
    switch (resizeDirection) {
      // Corner handles - change both dimensions
      case 'se':
        newWidth = startSize.width + deltaX;
        newHeight = startSize.height + deltaY;
        break;
      case 'sw':
        newWidth = startSize.width - deltaX;
        newHeight = startSize.height + deltaY;
        break;
      case 'ne':
        newWidth = startSize.width + deltaX;
        newHeight = startSize.height - deltaY;
        break;
      case 'nw':
        newWidth = startSize.width - deltaX;
        newHeight = startSize.height - deltaY;
        break;
        
      // Edge handles - change only one dimension
      case 'e':
        newWidth = startSize.width + deltaX;
        break;
      case 'w':
        newWidth = startSize.width - deltaX;
        break;
      case 's':
        newHeight = startSize.height + deltaY;
        break;
      case 'n':
        newHeight = startSize.height - deltaY;
        break;
    }
    
    // Apply constraints with better minimums for text readability
    const absoluteMinWidth = Math.max(minWidth, 120);  // Increased from 100px
    const absoluteMinHeight = Math.max(minHeight, 50);  // Increased from 40px
    
    newWidth = Math.max(absoluteMinWidth, Math.min(maxWidth, newWidth));
    newHeight = Math.max(absoluteMinHeight, Math.min(maxHeight, newHeight));
    
    return { width: newWidth, height: newHeight };
  }, [resizeDirection, resizeStart, startSize, minWidth, maxWidth, minHeight, maxHeight]);

  const calculateRotation = useCallback((clientX: number, clientY: number) => {
    if (!elementRef.current || !containerRef.current) return currentRotation;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2 + position.x;
    const centerY = containerRect.top + containerRect.height / 2 + position.y;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = (angle * 180) / Math.PI + 90;
    
    // Snap to 15-degree increments
    const snappedDegrees = Math.round(degrees / 15) * 15;
    return snappedDegrees % 360;
  }, [position, currentRotation]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    if (isDragging) {
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
      const newX = startPosition.x + deltaX;
      const newY = startPosition.y + deltaY;
      
      // Constrain to container bounds
      const containerRect = containerRef.current.getBoundingClientRect();
      const padding = 40;
      const maxX = containerRect.width / 2 - padding;
      const maxY = containerRect.height / 2 - padding;
      const minX = -containerRect.width / 2 + padding;
      const minY = -containerRect.height / 2 + padding;
      
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
      onMove(id, { x: constrainedX, y: constrainedY });
    } else if (isResizing) {
      // Calculate and apply real-time size for smooth preview
      const newSize = calculateNewSize(clientX, clientY);
      setCurrentSize(newSize);
    } else if (isRotating) {
      // Calculate and apply real-time rotation
      const newRotation = calculateRotation(clientX, clientY);
      setCurrentRotation(newRotation);
    }
  }, [
    isDragging, isResizing, isRotating, dragStart, startPosition, 
    calculateNewSize, calculateRotation, onMove, id
  ]);

  const handleMouseMove = (e: MouseEvent) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      handleMove(e.clientX, e.clientY);
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      rafId.current = requestAnimationFrame(() => {
        handleMove(touch.clientX, touch.clientY);
      });
    }
    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    if (isResizing && onResize) {
      // Finalize the resize
      onResize(id, currentSize);
    }
    
    if (isRotating && onRotate) {
      // Finalize the rotation
      onRotate(id, currentRotation);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeDirection('');
  };

  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
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
  }, [isDragging, isResizing, isRotating]);

  // Handle global clicks to deselect
  useEffect(() => {
    const handleGlobalClick = () => {
      if (isSelected && !isDragging && !isResizing && !isRotating) {
        onSelect?.(null);
      }
    };

    if (isSelected) {
      document.addEventListener('click', handleGlobalClick);
      return () => document.removeEventListener('click', handleGlobalClick);
    }
  }, [isSelected, isDragging, isResizing, isRotating, onSelect]);

  const resizeHandles = [
    // Corner handles - change both dimensions
    { direction: 'nw', cursor: 'nw-resize', position: '-top-1 -left-1' },
    { direction: 'ne', cursor: 'ne-resize', position: '-top-1 -right-1' },
    { direction: 'se', cursor: 'se-resize', position: '-bottom-1 -right-1' },
    { direction: 'sw', cursor: 'sw-resize', position: '-bottom-1 -left-1' },
    // Edge handles - change only one dimension
    { direction: 'n', cursor: 'n-resize', position: '-top-1 left-1/2 -translate-x-1/2' },
    { direction: 's', cursor: 's-resize', position: '-bottom-1 left-1/2 -translate-x-1/2' },
    { direction: 'e', cursor: 'e-resize', position: 'top-1/2 -right-1 -translate-y-1/2' },
    { direction: 'w', cursor: 'w-resize', position: 'top-1/2 -left-1 -translate-y-1/2' },
  ];

  // Generate text color styles based on text type
  const getTextColorStyles = useCallback(() => {
    if (!customization?.textColors) return {};
    
    const colorKey = id === 'brideName' ? 'brideName' 
                   : id === 'groomName' ? 'groomName'
                   : id === 'weddingDate' ? 'date'
                   : id === 'venue' ? 'venue'
                   : id === 'message' ? 'message'
                   : null;
    
    return colorKey && customization.textColors[colorKey] 
      ? { color: customization.textColors[colorKey] }
      : {};
  }, [id, customization]);

  const textColorStyles = getTextColorStyles();

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${
        isDragging || isResizing || isRotating ? 'z-50' : isSelected ? 'z-40' : 'z-10'
      } ${!isResizing && !isRotating ? 'cursor-move' : ''} group ${className}`}
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${currentRotation}deg)`,
        left: '50%',
        top: '50%',
        touchAction: 'none',
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <div 
        className={`relative w-full h-full flex items-center justify-center p-2 ${
          isDragging || isResizing || isRotating ? 'shadow-2xl' : isSelected ? 'shadow-lg' : ''
        } ${isSelected ? 'ring-2 ring-primary/50 ring-offset-1' : ''}`}
        style={{
          overflow: 'hidden',
          wordWrap: 'break-word',
          hyphens: 'auto',
          lineHeight: '1.2',
          ...textColorStyles,
        }}
      >
        {children}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded bg-primary/5 pointer-events-none" />
        )}
        
        {/* Size and Rotation Indicator */}
        {isSelected && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded font-mono whitespace-nowrap pointer-events-none">
            {Math.round(currentSize.width)} × {Math.round(currentSize.height)} • {Math.round(currentRotation)}°
          </div>
        )}
        
        {/* Rotation Handle */}
        {isSelected && onRotate && (
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full shadow-lg hover:scale-125 transition-all duration-200 z-50 cursor-grab flex items-center justify-center"
            onMouseDown={handleRotationMouseDown}
            onTouchStart={handleRotationTouchStart}
          >
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        )}
        
        {/* Resize handles */}
        {isSelected && resizeHandles.map((handle) => (
          <div
            key={handle.direction}
            className={`absolute w-3 h-3 bg-primary border-2 border-white rounded-full shadow-lg hover:scale-125 transition-all duration-200 z-50 ${handle.position}`}
            style={{ cursor: handle.cursor }}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
            onTouchStart={(e) => handleResizeTouchStart(e, handle.direction)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResizableTextBox;