import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition, TemplateCustomization } from '@/types';

interface DynamicTextElementProps {
  id: string;
  text: string;
  fontSize: number;
  position: ElementPosition;
  rotation: number;
  isSelected: boolean;
  isEditing: boolean;
  onTextChange: (id: string, text: string) => void;
  onFontSizeChange: (id: string, fontSize: number) => void;
  onClick: () => void;
  onDoubleClick: () => void;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  customization?: TemplateCustomization;
}

const DynamicTextElement = ({
  id,
  text,
  fontSize,
  position,
  rotation,
  isSelected,
  isEditing,
  onTextChange,
  onFontSizeChange,
  onClick,
  onDoubleClick,
  color = '#000000',
  fontFamily = 'Arial, sans-serif',
  fontWeight = 'normal',
  textAlign = 'center',
  customization
}: DynamicTextElementProps) => {
  const [currentText, setCurrentText] = useState(text);
  const [dimensions, setDimensions] = useState({ width: 100, height: 20 });
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Update current text when prop changes
  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  // Update dimensions when text or font changes with force update
  useEffect(() => {
    const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const newDimensions = getTextDimensions(currentText, fontStyle);
    console.log('🟡 DynamicTextElement dimensions update:', id, newDimensions, 'text length:', currentText.length);
    
    // Force update dimensions state to trigger re-render
    setDimensions(prev => {
      if (prev.width !== newDimensions.width || prev.height !== newDimensions.height) {
        console.log('🟡 Dimensions changed from', prev, 'to', newDimensions);
        return newDimensions;
      }
      return prev;
    });
  }, [currentText, fontSize, fontFamily, fontWeight, id]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Calculate text dimensions with real-time updates and performance optimization
  const getTextDimensions = (textContent: string, font: string) => {
    if (!measureRef.current) return { width: 100, height: 20 };
    
    // Use requestAnimationFrame for smooth updates
    measureRef.current.style.font = font;
    measureRef.current.style.whiteSpace = 'pre-wrap';
    measureRef.current.style.wordBreak = 'break-word';
    measureRef.current.textContent = textContent || 'Click to edit';
    
    const rect = measureRef.current.getBoundingClientRect();
    return {
      width: Math.max(Math.ceil(rect.width + 24), 80), // Ceil for crisp pixels
      height: Math.max(Math.ceil(rect.height + 16), 24) // Ceil for crisp pixels
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentText(newText);
    
    // Immediate real-time dimension updates for instant border resizing
    requestAnimationFrame(() => {
      const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`;
      const newDimensions = getTextDimensions(newText, fontStyle);
      
      console.log('🟡 Real-time input change - new dimensions:', newDimensions);
      
      // Force immediate dimensions update for real-time border feedback
      setDimensions(newDimensions);
      
      // Notify parent of text change
      onTextChange(id, newText);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setCurrentText(text); // Reset to original text
      inputRef.current?.blur();
    }
  };


  return (
    <>
      {/* Hidden element for text measurement */}
      <div
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none whitespace-nowrap"
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          fontWeight,
          left: '-9999px',
          top: '-9999px'
        }}
      />

      {/* Text Display/Input Container - Auto-expanding */}
      <div
        ref={textRef}
        className={`relative inline-block select-none ${
          isSelected ? 'ring-2 ring-primary/50 ring-offset-1' : ''
        } ${isEditing ? 'bg-white/90 backdrop-blur-sm shadow-lg' : ''} transition-all duration-150 ease-out`}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          minWidth: '80px',
          minHeight: '24px',
          padding: '8px 12px',
          borderRadius: isEditing ? '6px' : '2px',
          border: isEditing 
            ? '2px solid hsl(var(--primary))' 
            : isSelected 
              ? '1px dashed hsl(var(--primary) / 0.4)' 
              : 'none',
          cursor: isEditing ? 'text' : 'move',
          overflow: 'visible',
          // Smooth resizing performance
          willChange: isEditing ? 'width, height' : 'auto',
          backfaceVisibility: 'hidden', // Prevent flickering
        }}
        onClick={(e) => {
          console.log('🟠 DynamicTextElement onClick:', id);
          e.stopPropagation();
          onClick();
        }}
        onDoubleClick={(e) => {
          console.log('🟠 DynamicTextElement onDoubleClick:', id);
          e.stopPropagation();
          onDoubleClick();
        }}
        data-draggable-element={id}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={currentText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full resize-none border-none outline-none bg-transparent overflow-hidden"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              fontWeight,
              color,
              textAlign,
              lineHeight: '1.2'
            }}
            rows={1}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily,
              fontWeight,
              color,
              textAlign,
              lineHeight: '1.2',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {currentText || 'Click to edit'}
          </div>
        )}

        {/* Dynamic Border Indicator with smooth transitions */}
        {isSelected && !isEditing && (
          <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded pointer-events-none transition-all duration-150 ease-out animate-pulse" />
        )}

        {/* Resize Preview for Text */}
        {isSelected && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded font-mono whitespace-nowrap pointer-events-none">
            {Math.round(fontSize)}px
          </div>
        )}
      </div>
    </>
  );
};

export default DynamicTextElement;