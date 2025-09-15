import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition, TemplateCustomization } from '@/types';

interface TextDraggableElementProps {
  id: string;
  position: ElementPosition;
  onMove: (elementId: string, position: ElementPosition) => void;
  onFontSizeChange?: (elementId: string, fontSize: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
  resizable?: boolean;
  fontSize?: number;
  minFontSize?: number;
  maxFontSize?: number;
  maintainAspectRatio?: boolean;
  isSelected?: boolean;
  onSelect?: (elementId: string | null) => void;
  customization?: TemplateCustomization;
}

const TextDraggableElement = ({ 
  id, 
  position, 
  onMove, 
  onFontSizeChange,
  containerRef, 
  children, 
  resizable = false,
  fontSize = 16,
  minFontSize = 8,
  maxFontSize = 72,
  maintainAspectRatio = true,
  isSelected = false,
  onSelect,
  customization
}: TextDraggableElementProps) => {
  console.log('🟢 TextDraggableElement rendering:', id, { fontSize, isSelected });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startFontSize, setStartFontSize] = useState(fontSize);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  
  // Real-time scaling state for smooth preview
  const [currentScale, setCurrentScale] = useState(1);
  const [previewFontSize, setPreviewFontSize] = useState(fontSize);
  const [elementDimensions, setElementDimensions] = useState({ width: 'auto', height: 'auto' });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Update preview font size when fontSize prop changes
  useEffect(() => {
    setPreviewFontSize(fontSize);
  }, [fontSize]);

  // Measure and update element dimensions based on content
  const measureContent = useCallback(() => {
    if (!measureRef.current || !contentRef.current) return;
    
    // Clone the content to measure it without affecting layout
    const content = contentRef.current.cloneNode(true) as HTMLElement;
    measureRef.current.innerHTML = '';
    measureRef.current.appendChild(content);
    
    // Get the natural dimensions of the content
    const rect = measureRef.current.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    
    setElementDimensions({
      width: `${Math.max(width, 50)}px`,
      height: `${Math.max(height, 20)}px`
    });
  }, []);

  // Update dimensions when font size or content changes
  useEffect(() => {
    const timer = setTimeout(measureContent, 0);
    return () => clearTimeout(timer);
  }, [fontSize, previewFontSize, measureContent]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    console.log('🟠 TextDraggableElement handleClick:', id, 'isSelected:', isSelected);
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
    setStartFontSize(fontSize);
    setCurrentScale(1);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🟠 TextDraggableElement handleMouseDown:', id, 'isSelected:', isSelected);
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
    setStartFontSize(fontSize);
    setCurrentScale(1);
    onSelect?.(id);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const calculateScale = useCallback((clientX: number, clientY: number) => {
    const deltaX = clientX - resizeStart.x;
    const deltaY = clientY - resizeStart.y;
    
    let scaleChange = 0;
    
    // Calculate scale change based on resize direction
    switch (resizeDirection) {
      case 'se':
      case 'nw':
        // Use diagonal distance for proportional scaling
        scaleChange = (deltaX + deltaY) / 2;
        break;
      case 'sw':
      case 'ne':
        // Use diagonal distance but consider direction
        scaleChange = (deltaX - deltaY) / 2;
        break;
      case 'e':
      case 'w':
        scaleChange = Math.abs(deltaX);
        break;
      case 'n':
      case 's':
        scaleChange = Math.abs(deltaY);
        break;
    }
    
    // Convert pixel change to scale factor (more sensitive for text)
    const scaleFactor = 1 + (scaleChange / 100);
    
    // Constrain scale to reasonable bounds
    const minScale = minFontSize / startFontSize;
    const maxScale = maxFontSize / startFontSize;
    
    return Math.max(minScale, Math.min(maxScale, scaleFactor));
  }, [resizeDirection, resizeStart, startFontSize, minFontSize, maxFontSize]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
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
    } else if (isResizing && onFontSizeChange) {
      // Calculate and apply real-time scale for smooth preview
      const scale = calculateScale(clientX, clientY);
      setCurrentScale(scale);
      
      // Calculate preview font size for visual feedback
      const newFontSize = Math.round(startFontSize * scale);
      const constrainedSize = Math.max(minFontSize, Math.min(maxFontSize, newFontSize));
      setPreviewFontSize(constrainedSize);
      
      // Update dimensions immediately for real-time border feedback
      requestAnimationFrame(() => {
        measureContent();
      });
    }
  }, [
    isDragging, isResizing, dragStart, startPosition, 
    calculateScale, onMove, onFontSizeChange, id, minFontSize, maxFontSize, startFontSize
  ]);

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (isResizing && onFontSizeChange && currentScale !== 1) {
      // Convert final scale to font size and notify parent
      const finalFontSize = Math.round(startFontSize * currentScale);
      const constrainedFontSize = Math.max(minFontSize, Math.min(maxFontSize, finalFontSize));
      onFontSizeChange(id, constrainedFontSize);
      
      // Reset scale to 1 after font size conversion
      setCurrentScale(1);
      setPreviewFontSize(constrainedFontSize);
    }
    
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
  }, [isDragging, isResizing]);

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
    { direction: 'n', cursor: 'n-resize', position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'ne', cursor: 'ne-resize', position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'e', cursor: 'e-resize', position: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'se', cursor: 'se-resize', position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
    { direction: 's', cursor: 's-resize', position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { direction: 'sw', cursor: 'sw-resize', position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
    { direction: 'w', cursor: 'w-resize', position: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
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
    <>
      {/* Hidden element for measuring text dimensions */}
      <div
        ref={measureRef}
        className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none whitespace-nowrap"
        style={{
          fontSize: `${previewFontSize}px`,
          fontFamily: 'inherit',
          fontWeight: 'inherit',
        }}
      />
      
      <div
        ref={elementRef}
        className={`absolute select-none transition-all duration-200 ${
          isDragging || isResizing ? 'z-50' : isSelected ? 'z-40' : 'z-10'
        } ${!isResizing ? 'cursor-move' : ''} group`}
        style={{
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          left: '50%',
          top: '50%',
          touchAction: 'none',
          // Dynamic sizing based on content - this makes the border adapt!
          width: elementDimensions.width,
          height: elementDimensions.height,
          minWidth: '50px',
          minHeight: '20px',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
      >
        <div 
          ref={contentRef}
          className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
            isDragging || isResizing ? 'shadow-2xl' : isSelected ? 'shadow-lg' : ''
          } ${isSelected ? 'ring-2 ring-primary/50 ring-offset-1' : ''}`}
          style={{
            // Remove scale transform to prevent layout issues
            fontSize: `${previewFontSize}px`,
            ...textColorStyles,
          }}
        >
          {children}
          
          {/* Selection Indicator with dynamic sizing */}
          {isSelected && (
            <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded bg-primary/5 pointer-events-none animate-pulse" />
          )}
          
          {/* Font Size Indicator */}
          {isSelected && resizable && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded font-mono whitespace-nowrap pointer-events-none">
              {Math.round(previewFontSize)}px
            </div>
          )}
          
          {/* Resize handles */}
          {resizable && isSelected && (
            <>
              {resizeHandles.map((handle) => (
                <div
                  key={handle.direction}
                  className={`absolute ${isMobile ? 'w-6 h-6' : 'w-4 h-4'} bg-white border-2 border-primary rounded-full shadow-lg opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-150 ${handle.position}`}
                  style={{ cursor: handle.cursor }}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
                  onTouchStart={(e) => handleResizeTouchStart(e, handle.direction)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TextDraggableElement;