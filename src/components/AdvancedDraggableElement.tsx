import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition } from '@/types';
import { ResizeHandle } from '@/types/editor';
import { RotateCw } from 'lucide-react';

interface AdvancedDraggableElementProps {
  id: string;
  position: ElementPosition;
  onMove: (elementId: string, position: ElementPosition) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
  resizable?: boolean;
  size?: { width: number; height: number };
  rotation?: number;
  onResize?: (elementId: string, size: { width: number; height: number }) => void;
  onRotate?: (elementId: string, rotation: number) => void;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  maintainAspectRatio?: boolean;
  isSelected?: boolean;
  isLocked?: boolean;
  onSelect?: (elementId: string | null) => void;
  gridSize?: number;
  snapToGrid?: boolean;
  zIndex?: number;
  showAlignmentGuides?: boolean;
  alignmentThreshold?: number;
  otherElements?: Array<{ id: string; position: ElementPosition; size?: { width: number; height: number } }>;
}

const AdvancedDraggableElement = ({ 
  id, 
  position, 
  onMove, 
  containerRef, 
  children, 
  resizable = false,
  size = { width: 100, height: 100 },
  rotation = 0,
  onResize,
  onRotate,
  minSize = { width: 50, height: 50 },
  maxSize = { width: 300, height: 300 },
  maintainAspectRatio = false,
  isSelected = false,
  isLocked = false,
  onSelect,
  gridSize = 10,
  snapToGrid = false,
  zIndex = 10,
  showAlignmentGuides = false,
  alignmentThreshold = 5,
  otherElements = []
}: AdvancedDraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, angle: 0 });
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

  // Calculate rotation angle from mouse position
  const calculateRotation = useCallback((clientX: number, clientY: number) => {
    if (!elementRef.current || !containerRef.current) return rotation;

    const elementRect = elementRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const centerX = elementRect.left + elementRect.width / 2;
    const centerY = elementRect.top + elementRect.height / 2;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = (angle * 180) / Math.PI;
    
    return degrees + 90; // Adjust for handle position
  }, [rotation]);

  // Optimized interaction handler with requestAnimationFrame
  const optimizedInteraction = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (isDragging && !isLocked) {
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
      } else if (isResizing && !isLocked && onResize) {
        const deltaX = clientX - resizeStart.x;
        const deltaY = clientY - resizeStart.y;
        
        let newWidth = startSize.width;
        let newHeight = startSize.height;
        
        const handle = resizeHandles.find(h => h.direction === resizeDirection);
        
        if (handle) {
          switch (resizeDirection) {
            case 'n':
              newHeight = Math.max(minSize.height, Math.min(maxSize.height, startSize.height - deltaY));
              break;
            case 's':
              newHeight = Math.max(minSize.height, Math.min(maxSize.height, startSize.height + deltaY));
              break;
            case 'e':
              newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width + deltaX));
              break;
            case 'w':
              newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width - deltaX));
              break;
            case 'ne':
              newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width + deltaX));
              newHeight = handle.proportional && maintainAspectRatio 
                ? newWidth / aspectRatio 
                : Math.max(minSize.height, Math.min(maxSize.height, startSize.height - deltaY));
              break;
            case 'nw':
              newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width - deltaX));
              newHeight = handle.proportional && maintainAspectRatio 
                ? newWidth / aspectRatio 
                : Math.max(minSize.height, Math.min(maxSize.height, startSize.height - deltaY));
              break;
            case 'se':
              newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width + deltaX));
              newHeight = handle.proportional && maintainAspectRatio 
                ? newWidth / aspectRatio 
                : Math.max(minSize.height, Math.min(maxSize.height, startSize.height + deltaY));
              break;
            case 'sw':
              newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width - deltaX));
              newHeight = handle.proportional && maintainAspectRatio 
                ? newWidth / aspectRatio 
                : Math.max(minSize.height, Math.min(maxSize.height, startSize.height + deltaY));
              break;
          }
        }
        
        // Snap resize to grid
        if (snapToGrid) {
          newWidth = snapToGridValue(newWidth);
          newHeight = snapToGridValue(newHeight);
        }
        
        // Apply final constraints
        newWidth = Math.max(minSize.width, Math.min(maxSize.width, newWidth));
        newHeight = Math.max(minSize.height, Math.min(maxSize.height, newHeight));
        
        onResize(id, { width: newWidth, height: newHeight });
      } else if (isRotating && !isLocked && onRotate) {
        const newRotation = calculateRotation(clientX, clientY);
        onRotate(id, newRotation);
      }
    });
  }, [
    isDragging, isResizing, isRotating, isLocked, dragStart, startPosition, 
    resizeStart, startSize, resizeDirection, aspectRatio, snapToGrid, 
    snapToGridValue, showAlignmentGuides, alignmentThreshold, otherElements, 
    id, onMove, onResize, onRotate, calculateAlignmentGuides, calculateRotation
  ]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('Element clicked:', id);
    e.stopPropagation();
    onSelect?.(id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isResizing || isRotating || isLocked) return;
    
    console.log('Element mouse down:', id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isResizing || isRotating || isLocked) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setStartPosition(position);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (!containerRef.current || isLocked) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setStartSize(size);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResizeTouchStart = (e: React.TouchEvent, direction: string) => {
    if (!containerRef.current || isLocked) return;
    
    const touch = e.touches[0];
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: touch.clientX, y: touch.clientY });
    setStartSize(size);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRotationMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isLocked) return;
    
    setIsRotating(true);
    setRotationStart({ x: e.clientX, y: e.clientY, angle: rotation });
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRotationTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isLocked) return;
    
    const touch = e.touches[0];
    setIsRotating(true);
    setRotationStart({ x: touch.clientX, y: touch.clientY, angle: rotation });
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    optimizedInteraction(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      optimizedInteraction(touch.clientX, touch.clientY);
    }
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeDirection('');
    setAlignmentGuides([]);
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Global event listeners
  useEffect(() => {
    if (isDragging || isResizing || isRotating) {
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
  }, [isDragging, isResizing, isRotating]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Enhanced resize handles - 8 points (4 corners + 4 sides)
  const resizeHandles: ResizeHandle[] = [
    { direction: 'n', cursor: 'n-resize', position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', proportional: false },
    { direction: 'ne', cursor: 'ne-resize', position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2', proportional: true },
    { direction: 'e', cursor: 'e-resize', position: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2', proportional: false },
    { direction: 'se', cursor: 'se-resize', position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', proportional: true },
    { direction: 's', cursor: 's-resize', position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', proportional: false },
    { direction: 'sw', cursor: 'sw-resize', position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', proportional: true },
    { direction: 'w', cursor: 'w-resize', position: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2', proportional: false },
    { direction: 'nw', cursor: 'nw-resize', position: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2', proportional: true },
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
          isDragging || isResizing || isRotating ? 'z-50 scale-105' : `z-${Math.min(50, Math.max(10, zIndex))}`
        } ${!isResizing && !isRotating && !isDragging && !isLocked ? 'cursor-move' : ''} ${
          isLocked ? 'opacity-75' : ''
        } group`}
        style={{
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
          left: '50%',
          top: '50%',
          width: resizable ? `${size.width}px` : 'auto',
          height: resizable ? `${size.height}px` : 'auto',
          touchAction: 'none',
          willChange: isDragging || isResizing || isRotating ? 'transform' : 'auto',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        <div 
          className={`relative w-full h-full transition-all duration-100 ${
            isDragging || isResizing || isRotating ? 'shadow-2xl' : isSelected ? 'shadow-lg' : ''
          } ${isSelected && !isLocked ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-white/50' : ''} ${
            isLocked ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-white/50' : ''
          } rounded-sm`}
        >
          {children}
          
          {/* Selection Indicator */}
          {isSelected && !isLocked && (
            <div className="absolute -inset-2 border-2 border-primary/40 rounded-md bg-primary/5 pointer-events-none animate-pulse" />
          )}
          
          {/* Lock Indicator */}
          {isLocked && (
            <div className="absolute -inset-2 border-2 border-yellow-500/40 rounded-md bg-yellow-500/5 pointer-events-none" />
          )}
          
          {/* Rotation Handle */}
          {resizable && isSelected && !isLocked && (
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary border-2 border-white rounded-full shadow-lg cursor-grab hover:cursor-grabbing hover:scale-125 transition-all duration-200 flex items-center justify-center z-50"
              style={{ touchAction: 'none' }}
              onMouseDown={handleRotationMouseDown}
              onTouchStart={handleRotationTouchStart}
            >
              <RotateCw className="h-3 w-3 text-white" />
            </div>
          )}
          
          {/* Resize Handles - 8 Points */}
          {resizable && isSelected && !isLocked && (
            <>
              {resizeHandles.map((handle) => (
                <div
                  key={handle.direction}
                  className={`absolute ${
                    handle.proportional 
                      ? `${isMobile ? 'w-5 h-5' : 'w-4 h-4'} bg-primary border-2 border-white rounded-full` 
                      : `${isMobile ? 'w-4 h-3' : 'w-3 h-2'} bg-primary border border-white rounded-sm`
                  } shadow-lg opacity-100 hover:scale-125 transition-all duration-200 flex items-center justify-center z-50 ${handle.position}`}
                  style={{ cursor: handle.cursor, touchAction: 'none' }}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
                  onTouchStart={(e) => handleResizeTouchStart(e, handle.direction)}
                >
                  {handle.proportional && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdvancedDraggableElement;