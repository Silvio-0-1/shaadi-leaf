import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition } from '@/types';

interface OptimizedDraggableElementProps {
  id: string;
  position: ElementPosition;
  onMove: (elementId: string, position: ElementPosition) => void;
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
  gridSize?: number;
  snapToGrid?: boolean;
  zIndex?: number;
  onZIndexChange?: (elementId: string, direction: 'up' | 'down') => void;
  showAlignmentGuides?: boolean;
  alignmentThreshold?: number;
  otherElements?: Array<{ id: string; position: ElementPosition; size?: { width: number; height: number } }>;
}

const OptimizedDraggableElement = ({ 
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
  onSelect,
  gridSize = 10,
  snapToGrid = false,
  zIndex = 10,
  onZIndexChange,
  showAlignmentGuides = false,
  alignmentThreshold = 5,
  otherElements = []
}: OptimizedDraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [alignmentGuides, setAlignmentGuides] = useState<Array<{ type: 'horizontal' | 'vertical'; position: number }>>([]);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPositionRef = useRef(position);
  const isMobile = useIsMobile();

  // Update position ref when prop changes
  useEffect(() => {
    currentPositionRef.current = position;
  }, [position]);

  // Calculate aspect ratio
  useEffect(() => {
    if (maintainAspectRatio && size.width && size.height) {
      setAspectRatio(size.width / size.height);
    }
  }, [size.width, size.height, maintainAspectRatio]);

  // Snap to grid helper
  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Calculate alignment guides
  const calculateAlignmentGuides = useCallback((newPosition: ElementPosition) => {
    if (!showAlignmentGuides || !containerRef.current) return [];
    
    const guides: Array<{ type: 'horizontal' | 'vertical'; position: number }> = [];
    const containerRect = containerRef.current.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    // Check alignment with container center
    if (Math.abs(newPosition.x) < alignmentThreshold) {
      guides.push({ type: 'vertical', position: centerX });
    }
    if (Math.abs(newPosition.y) < alignmentThreshold) {
      guides.push({ type: 'horizontal', position: centerY });
    }
    
    // Check alignment with other elements
    otherElements.forEach(element => {
      if (element.id === id) return;
      
      const xDiff = Math.abs(newPosition.x - element.position.x);
      const yDiff = Math.abs(newPosition.y - element.position.y);
      
      if (xDiff < alignmentThreshold) {
        guides.push({ type: 'vertical', position: centerX + element.position.x });
      }
      if (yDiff < alignmentThreshold) {
        guides.push({ type: 'horizontal', position: centerY + element.position.y });
      }
    });
    
    return guides;
  }, [showAlignmentGuides, alignmentThreshold, otherElements, id, containerRef]);

  // Optimized move handler with requestAnimationFrame
  const optimizedMove = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (isDragging) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        
        let newX = startPosition.x + deltaX;
        let newY = startPosition.y + deltaY;
        
        // Snap to grid
        if (snapToGrid) {
          newX = snapToGridValue(newX);
          newY = snapToGridValue(newY);
        }
        
        // Constrain to container bounds with padding
        const padding = 40;
        const maxX = containerRect.width / 2 - padding;
        const maxY = containerRect.height / 2 - padding;
        const minX = -containerRect.width / 2 + padding;
        const minY = -containerRect.height / 2 + padding;
        
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
        
        // Check for alignment and snap
        if (showAlignmentGuides) {
          otherElements.forEach(element => {
            if (element.id === id) return;
            
            if (Math.abs(newX - element.position.x) < alignmentThreshold) {
              newX = element.position.x;
            }
            if (Math.abs(newY - element.position.y) < alignmentThreshold) {
              newY = element.position.y;
            }
          });
          
          // Snap to center
          if (Math.abs(newX) < alignmentThreshold) newX = 0;
          if (Math.abs(newY) < alignmentThreshold) newY = 0;
        }
        
        const newPosition = { x: newX, y: newY };
        currentPositionRef.current = newPosition;
        
        // Calculate and set alignment guides
        const guides = calculateAlignmentGuides(newPosition);
        setAlignmentGuides(guides);
        
        onMove(id, newPosition);
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
        
        // Snap resize to grid
        if (snapToGrid) {
          newWidth = snapToGridValue(newWidth);
          newHeight = snapToGridValue(newHeight);
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
    });
  }, [
    isDragging, isResizing, dragStart, startPosition, resizeStart, startSize, 
    resizeDirection, aspectRatio, snapToGrid, snapToGridValue, showAlignmentGuides,
    alignmentThreshold, otherElements, id, onMove, onResize, calculateAlignmentGuides
  ]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onSelect?.(id);
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

  const handleMouseMove = (e: MouseEvent) => {
    optimizedMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      optimizedMove(touch.clientX, touch.clientY);
    }
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
    setAlignmentGuides([]);
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Global event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
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
  }, [isDragging, isResizing]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const resizeHandles = [
    { direction: 'nw', cursor: 'nw-resize', position: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'ne', cursor: 'ne-resize', position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'se', cursor: 'se-resize', position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
    { direction: 'sw', cursor: 'sw-resize', position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
  ];

  return (
    <>
      {/* Alignment Guides */}
      {alignmentGuides.map((guide, index) => (
        <div
          key={`guide-${index}`}
          className="absolute pointer-events-none z-50"
          style={{
            ...(guide.type === 'vertical' 
              ? {
                  left: `${guide.position}px`,
                  top: 0,
                  width: '1px',
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
                }
              : {
                  left: 0,
                  top: `${guide.position}px`,
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#3b82f6',
                  boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)'
                }
            )
          }}
        />
      ))}
      
      {/* Draggable Element */}
      <div
        ref={elementRef}
        className={`absolute select-none transition-all duration-100 ${
          isDragging || isResizing ? 'z-50 scale-105' : `z-${Math.min(50, Math.max(10, zIndex))}`
        } ${!isResizing ? 'cursor-move' : ''} group`}
        style={{
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          left: '50%',
          top: '50%',
          width: resizable ? `${size.width}px` : 'auto',
          height: resizable ? `${size.height}px` : 'auto',
          touchAction: 'none',
          willChange: isDragging || isResizing ? 'transform' : 'auto',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        <div 
          className={`relative w-full h-full transition-all duration-100 ${
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
                  className={`absolute ${isMobile ? 'w-8 h-8' : 'w-5 h-5'} bg-white border-2 border-primary rounded-full shadow-lg opacity-90 hover:opacity-100 hover:scale-125 transition-all duration-150 flex items-center justify-center ${handle.position}`}
                  style={{ cursor: handle.cursor }}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
                  onTouchStart={(e) => handleResizeTouchStart(e, handle.direction)}
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OptimizedDraggableElement;