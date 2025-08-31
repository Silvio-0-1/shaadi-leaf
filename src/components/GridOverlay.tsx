import { useMemo } from 'react';

interface GridOverlayProps {
  visible: boolean;
  gridSize: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

const GridOverlay = ({ 
  visible, 
  gridSize, 
  containerRef
}: GridOverlayProps) => {
  const gridLines = useMemo(() => {
    if (!visible || !containerRef.current) return { vertical: [], horizontal: [] };
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const vertical: number[] = [];
    const horizontal: number[] = [];
    
    // Calculate vertical lines
    const centerX = width / 2;
    for (let x = centerX; x < width; x += gridSize) {
      vertical.push(x);
    }
    for (let x = centerX - gridSize; x > 0; x -= gridSize) {
      vertical.push(x);
    }
    
    // Calculate horizontal lines
    const centerY = height / 2;
    for (let y = centerY; y < height; y += gridSize) {
      horizontal.push(y);
    }
    for (let y = centerY - gridSize; y > 0; y -= gridSize) {
      horizontal.push(y);
    }
    
    return { vertical: vertical.sort((a, b) => a - b), horizontal: horizontal.sort((a, b) => a - b) };
  }, [visible, gridSize, containerRef]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-5 grid-overlay">
      {/* Vertical lines */}
      {gridLines.vertical.map((x, index) => (
        <div
          key={`v-${index}`}
          className="absolute top-0 bottom-0"
          style={{
            left: `${x}px`,
            backgroundColor: '#9ca3af',
            opacity: 0.3,
            width: '1px',
          }}
        />
      ))}
      
      {/* Horizontal lines */}
      {gridLines.horizontal.map((y, index) => (
        <div
          key={`h-${index}`}
          className="absolute left-0 right-0"
          style={{
            top: `${y}px`,
            backgroundColor: '#9ca3af',
            opacity: 0.3,
            height: '1px',
          }}
        />
      ))}
      
      {/* Center lines (more prominent) */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: '50%',
          backgroundColor: '#6b7280',
          opacity: 0.5,
          width: '1px',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="absolute left-0 right-0"
        style={{
          top: '50%',
          backgroundColor: '#6b7280',
          opacity: 0.5,
          height: '1px',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  );
};

export default GridOverlay;