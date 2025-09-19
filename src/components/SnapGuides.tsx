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
        const isCanvasCenter = guide.isCenter;
        
        return (
          <div
            key={guide.id}
            className={`absolute transition-all duration-200 ease-out ${
              guide.type === 'horizontal' ? 'h-0.5 w-full' : 'w-0.5 h-full'
            }`}
            style={{
              left: guide.type === 'vertical' ? `${guide.position}px` : 0,
              top: guide.type === 'horizontal' ? `${guide.position}px` : 0,
              transform: 'none',
              zIndex: guide.isActive ? 45 : 35,
              backgroundColor: 'transparent',
              borderStyle: 'dashed',
              borderWidth: guide.type === 'horizontal' ? '1px 0 0 0' : '0 0 0 1px',
              borderColor: guide.isActive 
                ? 'rgba(59, 130, 246, 0.8)' 
                : 'rgba(59, 130, 246, 0.5)',
              boxShadow: guide.isActive 
                ? '0 0 2px rgba(59, 130, 246, 0.4)' 
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