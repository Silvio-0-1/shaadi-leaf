import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface InlineTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: () => void;
  isMultiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

const InlineTextEditor = ({ 
  value, 
  onChange, 
  onComplete, 
  isMultiline = false,
  className = '',
  style = {},
  placeholder = ''
}: InlineTextEditorProps) => {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    console.log('🟢 InlineTextEditor mounting and focusing input');
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = useCallback(() => {
    onChange(editValue.trim() || value);
    onComplete();
  }, [editValue, onChange, onComplete, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isMultiline) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Enter' && e.shiftKey && isMultiline) {
      // Allow shift+enter for new lines in multiline
      return;
    } else if (e.key === 'Enter' && isMultiline) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onComplete();
    }
  };

  const handleBlur = () => {
    // Prevent immediate blur after mounting
    const timeSinceMount = Date.now() - mountTimeRef.current;
    if (timeSinceMount < 100) {
      console.log('🟡 InlineTextEditor handleBlur ignored - too soon after mount');
      return;
    }
    console.log('🔴 InlineTextEditor handleBlur called - this will reset editingElement to null');
    handleSubmit();
  };

  const commonProps = {
    ref: inputRef as any,
    value: editValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
    className: `border-2 border-primary bg-white/95 backdrop-blur-sm ${className}`,
    style: {
      ...style,
      minWidth: '100px',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      color: 'inherit',
      textAlign: 'inherit' as any,
      lineHeight: 'inherit',
    },
    placeholder: placeholder || value
  };

  if (isMultiline) {
    return <Textarea {...commonProps} rows={3} className={`resize-none ${commonProps.className}`} />;
  }

  return <Input {...commonProps} />;
};

export default InlineTextEditor;