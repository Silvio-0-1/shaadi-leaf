import React from 'react';

interface AlignmentGuidesProps {
  visible: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  guides: {
    horizontal: number[];
    vertical: number[];
  };
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  visible,
  containerRef,
  guides
}) => {
  if (!visible || !containerRef.current) return null;

  const containerRect = containerRef.current.getBoundingClientRect();
  const containerWidth = containerRef.current.offsetWidth;
  const containerHeight = containerRef.current.offsetHeight;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Horizontal alignment guides */}
      {guides.horizontal.map((y, index) => (
        <div
          key={`h-${index}`}
          className="absolute w-full h-0.5 bg-blue-500 opacity-80"
          style={{
            top: `${((y + containerHeight / 2) / containerHeight) * 100}%`,
            left: 0,
            right: 0,
          }}
        />
      ))}
      
      {/* Vertical alignment guides */}
      {guides.vertical.map((x, index) => (
        <div
          key={`v-${index}`}
          className="absolute h-full w-0.5 bg-blue-500 opacity-80"
          style={{
            left: `${((x + containerWidth / 2) / containerWidth) * 100}%`,
            top: 0,
            bottom: 0,
          }}
        />
      ))}
    </div>
  );
};

export default AlignmentGuides;