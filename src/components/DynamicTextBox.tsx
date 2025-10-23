// Updated DynamicTextBox.tsx with improved font scaling

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ElementPosition } from '@/types';

interface DynamicTextBoxProps {
  id: string;
  position: ElementPosition;
  onMove: (elementId: string, position: ElementPosition) => void;
  onResize: (elementId: string, size: { width: number; height: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  fontSize: number;
  fontFamily: string;
  text: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  isSelected: boolean;
  onSelect: (elementId: string) => void;
  customization?: any;
  rotation?: number;
  onRotate?: (elementId: string, rotation: number) => void;
  isLocked?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onTextChange?: (value: string) => void;
  autoSize?: boolean;
  children: React.ReactNode;
}

const DynamicTextBox: React.FC<DynamicTextBoxProps> = ({
  id,
  position,
  onMove,
  onResize,
  containerRef,
  fontSize,
  fontFamily,
  text,
  minWidth = 100,
  maxWidth = 600,
  minHeight = 40,
  maxHeight = 300,
  isSelected,
  onSelect,
  customization,
  rotation = 0,
  onRotate,
  isLocked = false,
  onDragStart,
  onDragEnd,
  onTextChange,
  autoSize = true,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [elementSize, setElementSize] = useState({ width: minWidth, height: minHeight });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: minWidth, height: minHeight });
  const [initialFontSize, setInitialFontSize] = useState(fontSize);
  const elementRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  // Calculate font size based on resize ratio with more flexible scaling
  const calculateFontSizeFromResize = useCallback((newSize: { width: number; height: number }) => {
    // Ensure we have valid initial values
    if (initialSize.width <= 0 || initialSize.height <= 0 || initialFontSize <= 0) {
      return fontSize; // Fallback to current font size
    }
    
    // Use the smaller dimension change for scaling to maintain readability
    const widthRatio = newSize.width / initialSize.width;
    const heightRatio = newSize.height / initialSize.height;
    const scaleRatio = Math.min(widthRatio, heightRatio);
    
    // Calculate new font size based on initial font size and scale ratio
    let newFontSize = initialFontSize * scaleRatio;
    
    // Set more reasonable bounds based on element type
    const elementMinFontSize = {
      'brideName': 8,
      'groomName': 8,
      'weddingDate': 6,
      'venue': 6,
      'message': 6
    };
    
    const elementMaxFontSize = {
      'brideName': 100,
      'groomName': 100,
      'weddingDate': 40,
      'venue': 36,
      'message': 32
    };
    
    const minFont = elementMinFontSize[id as keyof typeof elementMinFontSize] || 6;
    const maxFont = elementMaxFontSize[id as keyof typeof elementMaxFontSize] || 100;
    
    newFontSize = Math.max(minFont, Math.min(maxFont, newFontSize));
    
    return Math.round(newFontSize);
  }, [initialSize, initialFontSize, fontSize, id]);

  // Auto-sizing effect - only when text content changes, not during manual resize
  useEffect(() => {
    if (autoSize && textContentRef.current && !isResizing && !isDragging) {
      if (text && text.length > 0) {
        const textElement = textContentRef.current;
        
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.whiteSpace = id === 'message' ? 'pre-wrap' : 'nowrap';
        tempElement.style.fontSize = `${fontSize}px`;
        tempElement.style.fontFamily = fontFamily;
        tempElement.style.fontWeight = textElement.style.fontWeight || 'normal';
        tempElement.style.maxWidth = `${maxWidth}px`;
        tempElement.textContent = text;
        
        document.body.appendChild(tempElement);
        
        const measuredWidth = Math.max(minWidth, Math.min(maxWidth, tempElement.offsetWidth + 40));
        const measuredHeight = Math.max(minHeight, Math.min(maxHeight, tempElement.offsetHeight + 20));
        
        document.body.removeChild(tempElement);
        
        const newSize = { width: measuredWidth, height: measuredHeight };
        setElementSize(newSize);
      }
    }
  }, [text, isResizing, isDragging, autoSize, minWidth, maxWidth, minHeight, maxHeight, fontSize, fontFamily, id]);

  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 600, height: 400, left: 0, top: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top
    };
  }, [containerRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const isResizeHandle = target.classList.contains('resize-handle');
    
    if (isResizeHandle) {
      const handleType = target.getAttribute('data-handle');
      setIsResizing(true);
      setResizeHandle(handleType);
      onSelect(id);
      
      // Store initial values for proper font scaling
      setInitialSize({ ...elementSize });
      setInitialFontSize(fontSize);
      
      // Store the initial mouse position (don't update this during resize)
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    } else {
      setIsDragging(true);
      onSelect(id);
      onDragStart?.();

      const containerBounds = getContainerBounds();
      setDragStart({
        x: e.clientX - (position.x + containerBounds.width / 2),
        y: e.clientY - (position.y + containerBounds.height / 2)
      });
    }
  }, [isLocked, position, id, onSelect, onDragStart, getContainerBounds, elementSize, fontSize]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isLocked) return;

    if (isResizing && resizeHandle) {
      // Calculate new size based on initial size and total mouse movement from start
      const totalDeltaX = e.clientX - dragStart.x;
      const totalDeltaY = e.clientY - dragStart.y;
      
      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      
      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(minWidth, Math.min(maxWidth, initialSize.width - totalDeltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, initialSize.height - totalDeltaY));
          break;
        case 'ne':
          newWidth = Math.max(minWidth, Math.min(maxWidth, initialSize.width + totalDeltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, initialSize.height - totalDeltaY));
          break;
        case 'sw':
          newWidth = Math.max(minWidth, Math.min(maxWidth, initialSize.width - totalDeltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, initialSize.height + totalDeltaY));
          break;
        case 'se':
          newWidth = Math.max(minWidth, Math.min(maxWidth, initialSize.width + totalDeltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, initialSize.height + totalDeltaY));
          break;
      }
      
      const newSize = { width: newWidth, height: newHeight };
      setElementSize(newSize);
      
      // Calculate and apply new font size based on resize
      const newFontSize = calculateFontSizeFromResize(newSize);
      
      // Call onResize with both size and calculated font size
      onResize(id, newSize);
      
      // If there's a font size change callback, use it
      if (customization && onTextChange) {
        // This will be handled by the parent component's font size update logic
      }
      
      // Don't update dragStart during resize - keep it as the initial mouse position
    } else if (isDragging) {
      const containerBounds = getContainerBounds();
      const newX = e.clientX - dragStart.x - containerBounds.width / 2;
      const newY = e.clientY - dragStart.y - containerBounds.height / 2;
      
      const maxX = containerBounds.width / 2 - elementSize.width / 2;
      const minX = -containerBounds.width / 2 + elementSize.width / 2;
      const maxY = containerBounds.height / 2 - elementSize.height / 2;
      const minY = -containerBounds.height / 2 + elementSize.height / 2;
      
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
      onMove(id, { x: constrainedX, y: constrainedY });
    }
  }, [isLocked, isResizing, resizeHandle, isDragging, dragStart, elementSize, minWidth, maxWidth, minHeight, maxHeight, id, onResize, onMove, getContainerBounds, calculateFontSizeFromResize, customization, onTextChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
    }
  }, [isDragging, isResizing, onDragEnd]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const renderResizeHandles = () => {
    if (!isSelected || isLocked) return null;

    const handleStyle = {
      position: 'absolute' as const,
      width: '10px',
      height: '10px',
      backgroundColor: '#3b82f6',
      border: '2px solid white',
      borderRadius: '50%',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    };

    const handleMouseDownCapture = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleMouseDown(e);
    };

    return (
      <>
        <div
          className="resize-handle"
          data-handle="nw"
          style={{
            ...handleStyle,
            top: '-6px',
            left: '-6px',
            cursor: 'nw-resize'
          }}
          onMouseDown={handleMouseDownCapture}
        />
        <div
          className="resize-handle"
          data-handle="ne"
          style={{
            ...handleStyle,
            top: '-6px',
            right: '-6px',
            cursor: 'ne-resize'
          }}
          onMouseDown={handleMouseDownCapture}
        />
        <div
          className="resize-handle"
          data-handle="sw"
          style={{
            ...handleStyle,
            bottom: '-6px',
            left: '-6px',
            cursor: 'sw-resize'
          }}
          onMouseDown={handleMouseDownCapture}
        />
        <div
          className="resize-handle"
          data-handle="se"
          style={{
            ...handleStyle,
            bottom: '-6px',
            right: '-6px',
            cursor: 'se-resize'
          }}
          onMouseDown={handleMouseDownCapture}
        />
      </>
    );
  };

  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    width: `${elementSize.width}px`,
    height: `${elementSize.height}px`,
    cursor: isLocked ? 'default' : (isDragging ? 'grabbing' : 'grab'),
    userSelect: 'none',
    zIndex: isSelected ? 1000 : 10,
    transition: isResizing ? 'none' : 'all 0.2s ease-out',
    border: isSelected && !isLocked ? '2px dashed #3b82f6' : '2px solid transparent',
    borderRadius: '4px',
    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
  };

  return (
    <div
      ref={elementRef}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      data-text-element={id}
    >
      <div
        ref={textContentRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily
        }}
      >
        {children}
      </div>
      
      {renderResizeHandles()}
      
      {isLocked && isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            zIndex: 1001
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
};

export default DynamicTextBox;