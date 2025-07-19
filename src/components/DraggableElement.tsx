
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
  maxSize = { width: 300, height: 300 }
}: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || isResizing) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setStartSize(size);
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;

    if (isDragging) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
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
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(minSize.width, Math.min(maxSize.width, startSize.width + deltaX));
      const newHeight = Math.max(minSize.height, Math.min(maxSize.height, startSize.height + deltaY));
      
      onResize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, startPosition, resizeStart, startSize]);

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${isDragging || isResizing ? 'z-50 opacity-80' : 'z-10'} hover:opacity-80 transition-opacity ${!isResizing ? 'cursor-move' : ''}`}
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        left: '50%',
        top: '50%',
        width: resizable ? `${size.width}px` : 'auto',
        height: resizable ? `${size.height}px` : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`${isDragging || isResizing ? 'shadow-lg' : ''} transition-shadow relative`}>
        {children}
        {resizable && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={handleResizeMouseDown}
            style={{ transform: 'translate(50%, 50%)' }}
          />
        )}
      </div>
    </div>
  );
};

export default DraggableElement;
