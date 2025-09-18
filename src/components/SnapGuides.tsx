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
      {guides.map((guide) => (
        <div
          key={guide.id}
          className={`absolute ${
            guide.isActive 
              ? guide.isCenter 
                ? 'bg-red-500 opacity-80' 
                : 'bg-blue-500 opacity-60'
              : 'bg-gray-300 opacity-30'
          } ${
            guide.type === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
          } transition-opacity duration-150`}
          style={{
            left: guide.type === 'vertical' ? guide.position : 0,
            top: guide.type === 'horizontal' ? guide.position : 0,
            zIndex: guide.isActive ? 45 : 35,
          }}
        />
      ))}

      {/* Snap tooltip */}
      {snapTooltip && (
        <div
          className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-50 whitespace-nowrap"
          style={{
            left: snapTooltip.x,
            top: snapTooltip.y - 30,
            transform: 'translateX(-50%)',
          }}
        >
          {snapTooltip.message}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default SnapGuides;