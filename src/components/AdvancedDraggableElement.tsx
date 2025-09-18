import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition, TemplateCustomization, TextBorderConfiguration } from '@/types';
import { ResizeHandle } from '@/types/editor';
import { RotateCw } from 'lucide-react';
import { TextElementBorder } from './TextElementBorder';

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
  customization?: TemplateCustomization;
  fontSize?: number;
  onFontSizeChange?: (elementId: string, fontSize: number) => void;
  textBorderConfig?: TextBorderConfiguration;
  onDoubleClick?: (elementId: string) => void;
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
  otherElements = [],
  customization,
  fontSize = 16,
  onFontSizeChange,
  textBorderConfig,
  onDoubleClick
}: AdvancedDraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, angle: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startFontSize, setStartFontSize] = useState(16);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [alignmentGuides, setAlignmentGuides] = useState<Array<{ type: 'horizontal' | 'vertical'; position: number }>>([]);
  const [showRotationIndicator, setShowRotationIndicator] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPositionRef = useRef(position);
  const throttleRef = useRef<number>(0);
  const isMobile = useIsMobile();

  // Text elements no longer use borders - use text colors instead
  const getTextColorStyles = useCallback(() => {
    const textElements = ['brideName', 'groomName', 'weddingDate', 'venue', 'message'];
    if (!textElements.includes(id) || !customization?.textColors) {
      return {};
    }
    
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

  // Helper function to check if element is a text element
  const isTextElement = useCallback(() => {
    const textElements = ['brideName', 'groomName', 'weddingDate', 'venue', 'message'];
    return textElements.includes(id);
  }, [id]);

  const textColorStyles = getTextColorStyles();

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

  // Calculate rotation angle from mouse position with snapping
  const calculateRotation = useCallback((clientX: number, clientY: number) => {
    if (!elementRef.current || !containerRef.current) return rotation;

    const elementRect = elementRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const centerX = elementRect.left + elementRect.width / 2;
    const centerY = elementRect.top + elementRect.height / 2;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    let degrees = (angle * 180) / Math.PI + 90; // Adjust for handle position
    
    // Normalize to 0-360
    degrees = ((degrees % 360) + 360) % 360;
    
    // Snap to common angles (0, 90, 180, 270) with 5 degree tolerance
    const snapAngles = [0, 90, 180, 270, 360];
    const snapTolerance = 5;
    
    for (const snapAngle of snapAngles) {
      if (Math.abs(degrees - snapAngle) <= snapTolerance) {
        degrees = snapAngle % 360;
        break;
      }
    }
    
    return degrees;
  }, [rotation]);

  // Optimized interaction handler with requestAnimationFrame and throttling
  const optimizedInteraction = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    // Throttle updates to 60fps max
    const now = performance.now();
    if (now - throttleRef.current < 16) return;
    throttleRef.current = now;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      // For text elements, only start dragging if there's significant movement
      if (!isDragging && isTextElement() && dragStart.x !== 0 && dragStart.y !== 0) {
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Start dragging if moved more than 5 pixels
        if (distance > 5) {
          setIsDragging(true);
        }
      }
      
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
      } else if (isResizing && !isLocked) {
        const deltaX = clientX - resizeStart.x;
        const deltaY = clientY - resizeStart.y;
        
        // Check if this is a text element
        if (isTextElement() && onFontSizeChange) {
          // For text elements, resize affects font size
          const handle = resizeHandles.find(h => h.direction === resizeDirection);
          
          if (handle) {
            let scaleFactor = 0;
            
            if (handle.proportional) {
              // Corner handles - use diagonal distance for more intuitive resizing
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              const direction = deltaX + deltaY > 0 ? 1 : -1;
              scaleFactor = direction * distance * 0.1; // Adjust sensitivity
            } else {
              // Side handles - use direction-specific resizing
              switch (resizeDirection) {
                case 'e':
                  scaleFactor = deltaX * 0.15; // Right side - positive deltaX increases size
                  break;
                case 'w':
                  scaleFactor = -deltaX * 0.15; // Left side - negative deltaX increases size  
                  break;
                case 's':
                  scaleFactor = deltaY * 0.15; // Bottom side - positive deltaY increases size
                  break;
                case 'n':
                  scaleFactor = -deltaY * 0.15; // Top side - negative deltaY increases size
                  break;
              }
            }
            
            let newFontSize = startFontSize + scaleFactor;
            
            // Apply font size constraints
            newFontSize = Math.max(8, Math.min(72, newFontSize));
            
            onFontSizeChange(id, newFontSize);
          }
        } else if (onResize) {
          // For photo elements, resize affects width/height
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
        }
      } else if (isRotating && !isLocked && onRotate) {
        const newRotation = calculateRotation(clientX, clientY);
        setRotationDegrees(newRotation);
        setShowRotationIndicator(true);
        onRotate(id, newRotation);
      }
    });
  }, [
    isDragging, isResizing, isRotating, isLocked, dragStart, startPosition, 
    resizeStart, startSize, startFontSize, resizeDirection, aspectRatio, snapToGrid, 
    snapToGridValue, showAlignmentGuides, alignmentThreshold, otherElements, 
    id, onMove, onResize, onRotate, onFontSizeChange, calculateAlignmentGuides, 
    calculateRotation, isTextElement, fontSize
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🟠 AdvancedDraggableElement handleMouseDown:', id, 'isSelected:', isSelected);
    e.stopPropagation(); // Prevent card onClick from firing
    if (!containerRef.current || isResizing || isRotating) return;
    
    // Allow selection even when locked so users can access the unlock button
    if (isLocked) {
      if (!isSelected) {
        console.log('🟢 AdvancedDraggableElement calling onSelect for locked element:', id);
        onSelect?.(id);
      }
      return;
    }
    
    // Handle double-click for text elements
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (isTextElement() && onDoubleClick && lastClickTime > 0 && timeDiff < 300) {
      console.log('🟢 AdvancedDraggableElement double-click detected for text element:', id, 'timeDiff:', timeDiff);
      console.log('🔍 onDoubleClick prop exists:', !!onDoubleClick, 'calling with id:', id);
      onDoubleClick(id);
      setLastClickTime(0); // Reset to prevent triple-clicks
      return;
    }
    
    setLastClickTime(currentTime);
    
    // For text elements, just select on single click - don't start dragging
    if (isTextElement()) {
      if (!isSelected) {
        console.log('🟢 AdvancedDraggableElement calling onSelect for text element:', id);
        onSelect?.(id);
      }
      // Store drag start info but don't set dragging state yet
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartPosition(position);
    } else {
      // Non-text elements behave normally
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setStartPosition(position);
      if (!isSelected) {
        console.log('🟢 AdvancedDraggableElement calling onSelect from mousedown:', id);
        onSelect?.(id);
      }
    }
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current || isResizing || isRotating) return;
    
    // Allow selection even when locked so users can access the unlock button
    if (isLocked) {
      if (!isSelected) {
        console.log('🟢 AdvancedDraggableElement calling onSelect for locked element (touch):', id);
        onSelect?.(id);
      }
      return;
    }
    
    // Handle double-tap for text elements
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (isTextElement() && onDoubleClick && lastClickTime > 0 && timeDiff < 300) {
      console.log('🟢 AdvancedDraggableElement double-tap detected for text element:', id, 'timeDiff:', timeDiff);
      onDoubleClick(id);
      setLastClickTime(0); // Reset to prevent triple-taps
      return;
    }
    
    setLastClickTime(currentTime);
    
    // For text elements, just select on single tap - don't start dragging
    if (isTextElement()) {
      onSelect?.(id);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setStartPosition(position);
    } else {
      // Non-text elements behave normally
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setStartPosition(position);
      onSelect?.(id);
    }
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    if (!containerRef.current || isLocked) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setStartSize(size);
    setStartFontSize(fontSize); // Store starting font size for text elements
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
    setStartFontSize(fontSize); // Store starting font size for text elements
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
    setShowRotationIndicator(false);
    // Reset drag start for text elements
    setDragStart({ x: 0, y: 0 });
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Global event listeners - also listen for text element movement detection
  useEffect(() => {
    if (isDragging || isResizing || isRotating || (isTextElement() && dragStart.x !== 0 && dragStart.y !== 0)) {
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
  }, [isDragging, isResizing, isRotating, dragStart.x, dragStart.y, isTextElement]);

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
      
      {/* Rotation Degree Indicator */}
      {showRotationIndicator && isSelected && (
        <div
          className="absolute pointer-events-none z-50 bg-black/80 text-white px-2 py-1 rounded text-sm font-mono whitespace-nowrap"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${position.x + 60}px, ${position.y - 40}px)`,
          }}
        >
          {Math.round(rotationDegrees)}°
        </div>
      )}
      
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
        data-draggable-element={id}
      >
        <div 
          className={`relative w-full h-full transition-all duration-100 ${
            // Only apply photo element styles for non-text elements
            !isTextElement() ? (
              `${isDragging || isResizing || isRotating ? 'shadow-2xl' : isSelected ? 'shadow-lg' : ''} ${
                isSelected && !isLocked ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-white/50' : ''
              } ${isLocked ? 'ring-2 ring-yellow-500/50 ring-offset-1 ring-offset-white/50' : ''}`
            ) : ''
          } rounded-sm overflow-visible`}
        >
          {/* Apply text border framework for text elements, regular content for others */}
          {isTextElement() ? (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              {children}
              
              {/* Simple Selection Indicator for Text Elements */}
              {isSelected && !isLocked && (
                <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded bg-primary/5 pointer-events-none" />
              )}
              
              {/* Lock Indicator for Text Elements */}
              {isLocked && (
                <div className="absolute inset-0 border-2 border-dashed border-yellow-500/40 rounded bg-yellow-500/5 pointer-events-none" />
              )}
            </div>
          ) : (
            children
          )}
          
          {/* Selection Indicator - Only for photo elements (text elements have their own in TextElementBorder) */}
          {isSelected && !isLocked && !isTextElement() && (
            <div className="absolute -inset-2 border-2 border-primary/40 rounded-md bg-primary/5 pointer-events-none animate-pulse" />
          )}
          
          {/* Lock Indicator - Only for photo elements (text elements have their own in TextElementBorder) */}
          {isLocked && !isTextElement() && (
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
          
          {/* Resize Handles - only for photo elements (text elements use TextElementBorder) */}
          {resizable && isSelected && !isLocked && !isTextElement() && (
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