import React from 'react';

export interface SnapGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  isActive: boolean;
  isCenter?: boolean;
}

interface SnapGuidesProps {
  guides: SnapGuide[];
  containerSize: { width: number; height: number };
  snapTooltip?: { message: string; x: number; y: number } | null;
}

const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, containerSize, snapTooltip }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Render snap guides */}
      {guides.map((guide) => {
        const isVerticalCenter = guide.id === 'center-vertical';
        const isHorizontalCenter = guide.id === 'center-horizontal';
        
        return (
          <div
            key={guide.id}
            className={`absolute transition-all duration-200 ease-out ${
              guide.isActive 
                ? guide.isCenter 
                  ? 'bg-blue-400 opacity-90' 
                  : 'bg-blue-300 opacity-80'
                : 'bg-blue-200 opacity-30'
            } ${
              guide.type === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
            }`}
            style={{
              left: guide.type === 'vertical' 
                ? isVerticalCenter ? '50%' : `${guide.position}px`
                : 0,
              top: guide.type === 'horizontal' 
                ? isHorizontalCenter ? '50%' : `${guide.position}px` 
                : 0,
              transform: isVerticalCenter ? 'translateX(-50%)' : isHorizontalCenter ? 'translateY(-50%)' : 'none',
              zIndex: guide.isActive ? 45 : 35,
              boxShadow: guide.isActive 
                ? guide.isCenter 
                  ? '0 0 6px rgba(59, 130, 246, 0.4)' 
                  : '0 0 4px rgba(59, 130, 246, 0.3)'
                : 'none',
            }}
          />
        );
      })}

      {/* Snap tooltip - positioned at top center */}
      {snapTooltip && (
        <div
          className="absolute bg-blue-500/95 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg pointer-events-none z-50 whitespace-nowrap font-medium backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: '50%',
            top: '20px',
            transform: 'translateX(-50%)',
          }}
        >
          {snapTooltip.message}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500/95" />
        </div>
      )}
    </div>
  );
};

export default SnapGuides;