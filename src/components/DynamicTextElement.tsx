import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ElementPosition } from '@/types';

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
  textAlign = 'center'
}: DynamicTextElementProps) => {
  const [currentText, setCurrentText] = useState(text);
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Update current text when prop changes
  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Calculate text dimensions
  const getTextDimensions = (textContent: string, font: string) => {
    if (!measureRef.current) return { width: 100, height: 20 };
    
    measureRef.current.style.font = font;
    measureRef.current.textContent = textContent || 'A'; // Fallback to prevent empty
    
    const rect = measureRef.current.getBoundingClientRect();
    return {
      width: Math.max(rect.width + 20, 100), // Add padding + minimum width
      height: Math.max(rect.height + 10, 20) // Add padding + minimum height
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentText(newText);
    onTextChange(id, newText);
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

  const fontStyle = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const dimensions = getTextDimensions(currentText, fontStyle);

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

      {/* Text Display/Input Container */}
      <div
        ref={textRef}
        className={`relative inline-block select-none ${
          isSelected ? 'ring-2 ring-primary/50 ring-offset-1' : ''
        } ${isEditing ? 'bg-white/90 backdrop-blur-sm' : ''} transition-all duration-200`}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          minWidth: '100px',
          minHeight: '20px',
          padding: '5px 10px',
          borderRadius: isEditing ? '4px' : '0px',
          border: isEditing ? '2px solid hsl(var(--primary))' : 'none',
          cursor: isEditing ? 'text' : 'move'
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
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

        {/* Dynamic Border Indicator */}
        {isSelected && !isEditing && (
          <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded pointer-events-none animate-pulse" />
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