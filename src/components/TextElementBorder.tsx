import { ReactNode, useMemo } from 'react';
import { TextBorderConfiguration, TextBorderStyle, TextBorderGradient, TextBorderShadow } from '@/types/textBorder';

interface TextElementBorderProps {
  children: ReactNode;
  isSelected: boolean;
  isLocked: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  borderConfig?: TextBorderConfiguration;
  className?: string;
  onResizeMouseDown?: (e: React.MouseEvent, direction: string) => void;
  onResizeTouchStart?: (e: React.TouchEvent, direction: string) => void;
}

export const TextElementBorder = ({
  children,
  isSelected,
  isLocked,
  isDragging,
  isResizing,
  isRotating,
  borderConfig,
  className = '',
  onResizeMouseDown,
  onResizeTouchStart
}: TextElementBorderProps) => {
  
  // Generate CSS styles for the text border
  const borderStyles = useMemo(() => {
    if (!borderConfig?.enabled) {
      return {};
    }

    const { style, gradient, shadow } = borderConfig;
    let borderStyle: React.CSSProperties = {};
    let beforeStyle: React.CSSProperties = {};
    let afterStyle: React.CSSProperties = {};

    // Base border radius
    const borderRadius = `${style.radius}px`;

    switch (style.type) {
      case 'solid':
        borderStyle = {
          border: `${style.width}px solid ${style.color}`,
          borderRadius,
          opacity: style.opacity,
        };
        break;

      case 'dashed':
        borderStyle = {
          border: `${style.width}px dashed ${style.color}`,
          borderRadius,
          opacity: style.opacity,
        };
        break;

      case 'dotted':
        borderStyle = {
          border: `${style.width}px dotted ${style.color}`,
          borderRadius,
          opacity: style.opacity,
        };
        break;

      case 'double':
        borderStyle = {
          border: `${style.width}px double ${style.color}`,
          borderRadius,
          opacity: style.opacity,
        };
        break;

      case 'gradient':
        if (gradient) {
          const gradientString = `linear-gradient(${gradient.direction}deg, ${gradient.colors.join(', ')})`;
          borderStyle = {
            background: gradientString,
            borderRadius,
            opacity: style.opacity,
            padding: `${style.width}px`,
          };
          // Inner content background
          beforeStyle = {
            content: '""',
            position: 'absolute',
            inset: `${style.width}px`,
            background: 'var(--background, white)',
            borderRadius: `${Math.max(0, style.radius - style.width)}px`,
            zIndex: -1,
          };
        }
        break;

      case 'glow':
        borderStyle = {
          borderRadius,
          boxShadow: `0 0 ${style.width * 4}px ${style.color}${Math.round(style.opacity * 255).toString(16)}`,
          border: `1px solid ${style.color}${Math.round(style.opacity * 255).toString(16)}`,
        };
        break;

      case 'shadow':
        borderStyle = {
          border: `${style.width}px solid ${style.color}`,
          borderRadius,
          opacity: style.opacity,
        };
        break;

      case 'outline':
        borderStyle = {
          outline: `${style.width}px solid ${style.color}`,
          outlineOffset: '2px',
          borderRadius,
          opacity: style.opacity,
        };
        break;
    }

    // Add shadow if configured
    if (shadow) {
      const shadowString = `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
      borderStyle.boxShadow = borderStyle.boxShadow 
        ? `${borderStyle.boxShadow}, ${shadowString}`
        : shadowString;
    }

    // Add animations
    if (style.animation && style.animation !== 'none') {
      switch (style.animation) {
        case 'pulse':
          borderStyle.animation = 'textBorderPulse 2s ease-in-out infinite';
          break;
        case 'glow':
          borderStyle.animation = 'textBorderGlow 3s ease-in-out infinite alternate';
          break;
        case 'shimmer':
          borderStyle.animation = 'textBorderShimmer 2s linear infinite';
          break;
      }
    }

    return { borderStyle, beforeStyle, afterStyle };
  }, [borderConfig]);

  // Enhanced selection states for text elements
  const getTextSelectionStyle = () => {
    if (isLocked) {
      return {
        outline: '2px dashed #f59e0b',
        outlineOffset: '4px',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
      };
    }

    if (isSelected) {
      if (isDragging || isResizing || isRotating) {
        return {
          outline: '3px solid #3b82f6',
          outlineOffset: '6px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          transform: 'scale(1.02)',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
        };
      }
      return {
        outline: '2px solid #3b82f6',
        outlineOffset: '4px',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
      };
    }

    return {};
  };

  const combinedStyles = {
    ...borderStyles.borderStyle,
    ...getTextSelectionStyle(),
    position: 'relative' as const,
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes textBorderPulse {
          0%, 100% {
            opacity: ${borderConfig?.style.opacity || 1};
            transform: scale(1);
          }
          50% {
            opacity: ${Math.min(1, (borderConfig?.style.opacity || 1) + 0.3)};
            transform: scale(1.02);
          }
        }

        @keyframes textBorderGlow {
          0% {
            filter: brightness(1) saturate(1);
          }
          100% {
            filter: brightness(1.2) saturate(1.3);
          }
        }

        @keyframes textBorderShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>

      <div
        className={`text-element-border ${className}`}
        style={combinedStyles}
      >
        {/* Pseudo-element for gradient borders */}
        {borderConfig?.style.type === 'gradient' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={borderStyles.beforeStyle}
          />
        )}
        
        {children}
        
        {/* Enhanced selection indicator for text with interactive corners */}
        {isSelected && !isLocked && (
          <div className="absolute -inset-1">
            <div className="absolute inset-0 border-2 border-blue-400/60 rounded animate-pulse pointer-events-none" />
            {/* Interactive corner resize handles */}
            {onResizeMouseDown && onResizeTouchStart && (
              <>
                <div 
                  className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-nw-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'nw')}
                />
                <div 
                  className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-ne-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'ne')}
                />
                <div 
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-sw-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'sw')}
                />
                <div 
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-se-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'se')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'se')}
                />
                {/* Side resize handles */}
                <div 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-n-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'n')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'n')}
                />
                <div 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-s-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 's')}
                  onTouchStart={(e) => onResizeTouchStart(e, 's')}
                />
                <div 
                  className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-w-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'w')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'w')}
                />
                <div 
                  className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg cursor-e-resize hover:scale-125 transition-all duration-200 z-50"
                  onMouseDown={(e) => onResizeMouseDown(e, 'e')}
                  onTouchStart={(e) => onResizeTouchStart(e, 'e')}
                />
              </>
            )}
          </div>
        )}

        {/* Lock indicator for text */}
        {isLocked && (
          <div className="absolute -inset-1 pointer-events-none">
            <div className="absolute inset-0 border-2 border-amber-400/60 rounded-lg" />
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-b font-medium">
              🔒 Locked
            </div>
          </div>
        )}
      </div>
    </>
  );
};