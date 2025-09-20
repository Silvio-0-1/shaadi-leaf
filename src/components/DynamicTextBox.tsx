// Replace your entire DynamicTextBox.tsx file with this code:

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
  const elementRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

// Auto-size based on text content and font size
useEffect(() => {
  if (autoSize && textContentRef.current && !isResizing) {
    const textElement = textContentRef.current;
    
    // Create a temporary element to measure text dimensions
    const tempElement = document.createElement('div');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontSize = `${fontSize}px`;
    tempElement.style.fontFamily = fontFamily;
    tempElement.style.fontWeight = textElement.style.fontWeight || 'normal';
    tempElement.textContent = text || 'Sample Text';
    
    document.body.appendChild(tempElement);
    
    const measuredWidth = Math.max(minWidth, Math.min(maxWidth, tempElement.offsetWidth + 40));
    const measuredHeight = Math.max(minHeight, Math.min(maxHeight, tempElement.offsetHeight + 20));
    
    document.body.removeChild(tempElement);
    
    // Only update if dimensions changed significantly and we're not resizing
    if (Math.abs(elementSize.width - measuredWidth) > 5 || Math.abs(elementSize.height - measuredHeight) > 5) {
      const newSize = { width: measuredWidth, height: measuredHeight };
      setElementSize(newSize);
      onResize(id, newSize);
    }
  }
}, [text, fontSize, fontFamily, autoSize, minWidth, maxWidth, minHeight, maxHeight, id, onResize, isResizing]);

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
      // Handle corner resize
      const handleType = target.getAttribute('data-handle');
      setIsResizing(true);
      setResizeHandle(handleType);
      
      const containerBounds = getContainerBounds();
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    } else {
      // Handle drag (existing functionality)
      setIsDragging(true);
      onSelect(id);
      onDragStart?.();

      const containerBounds = getContainerBounds();
      setDragStart({
        x: e.clientX - (position.x + containerBounds.width / 2),
        y: e.clientY - (position.y + containerBounds.height / 2)
      });
    }
  }, [isLocked, position, id, onSelect, onDragStart, getContainerBounds]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isLocked) return;

    if (isResizing && resizeHandle) {
      // Handle corner resize
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      let newWidth = elementSize.width;
      let newHeight = elementSize.height;
      
      // Calculate new dimensions based on resize handle
      switch (resizeHandle) {
        case 'nw': // Northwest
          newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width - deltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height - deltaY));
          break;
        case 'ne': // Northeast
          newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width + deltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height - deltaY));
          break;
        case 'sw': // Southwest
          newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width - deltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height + deltaY));
          break;
        case 'se': // Southeast
          newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width + deltaX));
          newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height + deltaY));
          break;
      }
      
      // Smooth resize with transition
      const newSize = { width: newWidth, height: newHeight };
      setElementSize(newSize);
      onResize(id, newSize);
      
      // Update drag start for next movement
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      // Handle drag (existing functionality)
      const containerBounds = getContainerBounds();
      const newX = e.clientX - dragStart.x - containerBounds.width / 2;
      const newY = e.clientY - dragStart.y - containerBounds.height / 2;
      
      // Constrain to container bounds
      const maxX = containerBounds.width / 2 - elementSize.width / 2;
      const minX = -containerBounds.width / 2 + elementSize.width / 2;
      const maxY = containerBounds.height / 2 - elementSize.height / 2;
      const minY = -containerBounds.height / 2 + elementSize.height / 2;
      
      const constrainedX = Math.max(minX, Math.min(maxX, newX));
      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      
      onMove(id, { x: constrainedX, y: constrainedY });
    }
  }, [isLocked, isResizing, resizeHandle, isDragging, dragStart, elementSize, minWidth, maxWidth, minHeight, maxHeight, id, onResize, onMove, getContainerBounds]);

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

  // Mouse event listeners
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

  // Corner resize handles
  const renderResizeHandles = () => {
    if (!isSelected || isLocked) return null;

    const handleStyle = {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      backgroundColor: '#3b82f6',
      border: '2px solid white',
      borderRadius: '50%',
      cursor: 'pointer',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };

    return (
      <>
        {/* Northwest handle */}
        <div
          className="resize-handle"
          data-handle="nw"
          style={{
            ...handleStyle,
            top: '-4px',
            left: '-4px',
            cursor: 'nw-resize'
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Northeast handle */}
        <div
          className="resize-handle"
          data-handle="ne"
          style={{
            ...handleStyle,
            top: '-4px',
            right: '-4px',
            cursor: 'ne-resize'
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Southwest handle */}
        <div
          className="resize-handle"
          data-handle="sw"
          style={{
            ...handleStyle,
            bottom: '-4px',
            left: '-4px',
            cursor: 'sw-resize'
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Southeast handle */}
        <div
          className="resize-handle"
          data-handle="se"
          style={{
            ...handleStyle,
            bottom: '-4px',
            right: '-4px',
            cursor: 'se-resize'
          }}
          onMouseDown={handleMouseDown}
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
      {/* Text content wrapper */}
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
      
      {/* Resize handles */}
      {renderResizeHandles()}
      
      {/* Lock indicator */}
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
          🔴
        </div>
      )}
    </div>
  );
};

export default DynamicTextBox;