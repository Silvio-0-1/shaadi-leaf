
import { useState, useRef, useEffect, ReactNode } from 'react';

interface DraggableElementProps {
  id: string;
  position: { x: number; y: number };
  onMove: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  children: ReactNode;
}

const DraggableElement = ({ id, position, onMove, containerRef, children }: DraggableElementProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartPosition(position);
    
    // Prevent text selection during drag
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

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
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, startPosition]);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move select-none ${isDragging ? 'z-50 opacity-80' : 'z-10'} hover:opacity-80 transition-opacity`}
      style={{
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        left: '50%',
        top: '50%',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`${isDragging ? 'shadow-lg' : ''} transition-shadow`}>
        {children}
      </div>
    </div>
  );
};

export default DraggableElement;
