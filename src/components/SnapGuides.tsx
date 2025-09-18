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
          className={`absolute transition-all duration-150 ${
            guide.isActive 
              ? guide.isCenter 
                ? 'bg-blue-500 opacity-100 shadow-lg' 
                : 'bg-blue-400 opacity-80'
              : 'bg-blue-300 opacity-20'
          } ${
            guide.type === 'horizontal' ? 'h-0.5 w-full' : 'w-0.5 h-full'
          }`}
          style={{
            left: guide.type === 'vertical' ? guide.position : 0,
            top: guide.type === 'horizontal' ? guide.position : 0,
            zIndex: guide.isActive ? 45 : 35,
            boxShadow: guide.isActive ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none',
          }}
        />
      ))}

      {/* Snap tooltip */}
      {snapTooltip && (
        <div
          className="absolute bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md shadow-lg pointer-events-none z-50 whitespace-nowrap font-medium"
          style={{
            left: snapTooltip.x,
            top: snapTooltip.y - 35,
            transform: 'translateX(-50%)',
          }}
        >
          {snapTooltip.message}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-600" />
        </div>
      )}
    </div>
  );
};

export default SnapGuides;