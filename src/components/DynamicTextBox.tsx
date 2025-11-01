// Replace your entire DynamicTextBox.tsx file with this code:

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ElementPosition } from "@/types";

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
  disableAutoSize?: boolean;
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
  disableAutoSize = false,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isWidthResizing, setIsWidthResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [elementSize, setElementSize] = useState({ width: minWidth, height: minHeight });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasManuallyResized, setHasManuallyResized] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  // Auto-size based on text content and font size
  // Disable auto-sizing when manually resizing or when explicitly disabled
  useEffect(() => {
    // Only auto-size when text content or font size changes, not when resizing manually
    if (
      autoSize &&
      !disableAutoSize &&
      !hasManuallyResized &&
      textContentRef.current &&
      !isResizing &&
      !isDragging &&
      !isWidthResizing
    ) {
      if (text && text.length > 0) {
        const textElement = textContentRef.current;

        const tempElement = document.createElement("div");
        tempElement.style.position = "absolute";
        tempElement.style.visibility = "hidden";
        tempElement.style.whiteSpace = "nowrap";
        tempElement.style.fontSize = `${fontSize}px`;
        tempElement.style.fontFamily = fontFamily;
        tempElement.style.fontWeight = textElement.style.fontWeight || "normal";
        tempElement.textContent = text;

        document.body.appendChild(tempElement);

        const measuredWidth = Math.max(minWidth, Math.min(maxWidth, tempElement.offsetWidth + 40));
        const measuredHeight = Math.max(minHeight, Math.min(maxHeight, tempElement.offsetHeight + 20));

        document.body.removeChild(tempElement);

        // Update size without triggering resize callback to prevent loops
        const newSize = { width: measuredWidth, height: measuredHeight };
        setElementSize(newSize);
      }
    }
  }, [
    text,
    fontSize,
    fontFamily,
    isResizing,
    isDragging,
    isWidthResizing,
    autoSize,
    disableAutoSize,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    hasManuallyResized,
  ]); // Don't include onResize/id to prevent loops

  // Helper function to calculate height based on width and text content
  const calculateDynamicHeight = useCallback(
    (width: number) => {
      if (!textContentRef.current || !text) return minHeight;

      const tempElement = document.createElement("div");
      tempElement.style.position = "absolute";
      tempElement.style.visibility = "hidden";
      tempElement.style.width = `${width}px`;
      tempElement.style.fontSize = `${fontSize}px`;
      tempElement.style.fontFamily = fontFamily;
      tempElement.style.fontWeight = textContentRef.current.style.fontWeight || "normal";
      tempElement.style.lineHeight = "1.4";
      tempElement.style.padding = "8px";
      tempElement.style.wordWrap = "break-word";
      tempElement.style.overflowWrap = "break-word";
      tempElement.style.whiteSpace = "normal";
      tempElement.textContent = text;

      document.body.appendChild(tempElement);
      const measuredHeight = Math.max(minHeight, Math.min(maxHeight, tempElement.offsetHeight));
      document.body.removeChild(tempElement);

      return measuredHeight;
    },
    [text, fontSize, fontFamily, minHeight, maxHeight],
  );

  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 600, height: 400, left: 0, top: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };
  }, [containerRef]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isLocked) return;

      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const isResizeHandle = target.classList.contains("resize-handle");
      const isWidthHandle = target.classList.contains("width-resize-handle");

      if (isWidthHandle) {
        // Handle width-only resize
        setIsWidthResizing(true);
        onSelect(id);
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        });
      } else if (isResizeHandle) {
        // Handle corner resize - prevent event from bubbling
        const handleType = target.getAttribute("data-handle");
        setIsResizing(true);
        setResizeHandle(handleType);
        onSelect(id); // Make sure element is selected

        setDragStart({
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        // Handle drag (existing functionality)
        setIsDragging(true);
        onSelect(id);
        onDragStart?.();

        const containerBounds = getContainerBounds();
        setDragStart({
          x: e.clientX - (position.x + containerBounds.width / 2),
          y: e.clientY - (position.y + containerBounds.height / 2),
        });
      }
    },
    [isLocked, position, id, onSelect, onDragStart, getContainerBounds],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isLocked) return;

      if (isWidthResizing) {
        // Handle width-only resize - adjust height dynamically
        const deltaX = e.clientX - dragStart.x;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width + deltaX));

        // Calculate new height based on text wrapping at new width
        const newHeight = calculateDynamicHeight(newWidth);

        const newSize = { width: newWidth, height: newHeight };
        setElementSize(newSize);
        setHasManuallyResized(true);
        onResize(id, newSize);

        // Update drag start for next movement
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing && resizeHandle) {
        // Handle corner resize
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = elementSize.width;
        let newHeight = elementSize.height;

        // Calculate new dimensions based on resize handle
        switch (resizeHandle) {
          case "nw": // Northwest
            newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height - deltaY));
            break;
          case "ne": // Northeast
            newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height - deltaY));
            break;
          case "sw": // Southwest
            newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width - deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height + deltaY));
            break;
          case "se": // Southeast
            newWidth = Math.max(minWidth, Math.min(maxWidth, elementSize.width + deltaX));
            newHeight = Math.max(minHeight, Math.min(maxHeight, elementSize.height + deltaY));
            break;
        }

        // Smooth resize with transition
        const newSize = { width: newWidth, height: newHeight };
        setElementSize(newSize);
        setHasManuallyResized(true);
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
    },
    [
      isLocked,
      isWidthResizing,
      isResizing,
      resizeHandle,
      isDragging,
      dragStart,
      elementSize,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      id,
      onResize,
      onMove,
      getContainerBounds,
      calculateDynamicHeight,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
    }
    if (isWidthResizing) {
      setIsWidthResizing(false);
    }
  }, [isDragging, isResizing, isWidthResizing, onDragEnd]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing || isWidthResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isWidthResizing, handleMouseMove, handleMouseUp]);

  // Corner resize handles
  const renderResizeHandles = () => {
    if (!isSelected || isLocked) return null;

    const handleStyle = {
      position: "absolute" as const,
      width: "10px",
      height: "10px",
      backgroundColor: "#3b82f6",
      border: "2px solid white",
      borderRadius: "50%",
      zIndex: 1000,
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
    };

    const handleMouseDownCapture = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleMouseDown(e);
    };

    return (
      <>
        {/* Northwest handle */}
        <div
          className="resize-handle"
          data-handle="nw"
          style={{
            ...handleStyle,
            top: "-6px",
            left: "-6px",
            cursor: "nw-resize",
          }}
          onMouseDown={handleMouseDownCapture}
        />
        {/* Northeast handle */}
        <div
          className="resize-handle"
          data-handle="ne"
          style={{
            ...handleStyle,
            top: "-6px",
            right: "-6px",
            cursor: "ne-resize",
          }}
          onMouseDown={handleMouseDownCapture}
        />
        {/* Southwest handle */}
        <div
          className="resize-handle"
          data-handle="sw"
          style={{
            ...handleStyle,
            bottom: "-6px",
            left: "-6px",
            cursor: "sw-resize",
          }}
          onMouseDown={handleMouseDownCapture}
        />
        {/* Southeast handle */}
        <div
          className="resize-handle"
          data-handle="se"
          style={{
            ...handleStyle,
            bottom: "-6px",
            right: "-6px",
            cursor: "se-resize",
          }}
          onMouseDown={handleMouseDownCapture}
        />

        {/* Width-only resize handle (right edge middle) */}
        <div
          className="width-resize-handle"
          style={{
            position: "absolute",
            right: "-6px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "12px",
            height: "30px",
            backgroundColor: "#10b981",
            border: "2px solid white",
            borderRadius: "4px",
            cursor: "ew-resize",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
            opacity: isWidthResizing ? 1 : 0.8,
          }}
          onMouseDown={handleMouseDownCapture}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#059669";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            if (!isWidthResizing) {
              e.currentTarget.style.backgroundColor = "#10b981";
              e.currentTarget.style.opacity = "0.8";
            }
          }}
        />
      </>
    );
  };

  const elementStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    width: `${elementSize.width}px`,
    height: `${elementSize.height}px`,
    cursor: isLocked ? "default" : isDragging ? "grabbing" : "grab",
    userSelect: "none",
    zIndex: isSelected ? 1000 : 10,
    transition: isResizing || isWidthResizing ? "none" : "all 0.2s ease-out",
    border: isSelected && !isLocked ? "2px dashed #3b82f6" : "2px solid transparent",
    borderRadius: "4px",
    backgroundColor: isSelected ? "rgba(59, 130, 246, 0.1)" : "transparent",
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
        className="w-full h-full flex items-center justify-center"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          overflow: "hidden",
          padding: "8px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
          lineHeight: "1.4",
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
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "16px",
            height: "16px",
            backgroundColor: "#ef4444",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "white",
            zIndex: 1001,
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
};

export default DynamicTextBox;
