import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock, 
  Trash2,
  Type,
  ChevronDown
} from 'lucide-react';

interface ObjectToolbarProps {
  selectedElement: string | null;
  isElementLocked: boolean;
  visible: boolean;
  position: { x: number; y: number };
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  // Font controls
  fontSize?: number;
  fontFamily?: string;
  onFontSizeChange?: (size: number) => void;
  onFontFamilyChange?: (family: string) => void;
}

const ObjectToolbar = ({
  selectedElement,
  isElementLocked,
  visible,
  position,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onToggleLock,
  onDelete,
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange
}: ObjectToolbarProps) => {
  if (!visible || !selectedElement) return null;

  // Determine element type
  const isTextElement = ['brideName', 'groomName', 'weddingDate', 'venue', 'message'].includes(selectedElement);
  const isPhotoElement = selectedElement.startsWith('photo');
  const isDeletable = !['brideName', 'groomName'].includes(selectedElement);

  const fontOptions = [
    'Playfair Display', 'Cormorant Garamond', 'Crimson Text', 'Libre Baskerville',
    'Merriweather', 'Lora', 'Cinzel', 'Dancing Script', 'Great Vibes', 'Pacifico',
    'Alex Brush', 'Allura', 'Sacramento', 'Montserrat', 'Poppins', 'Inter'
  ];

  interface ToolbarAction {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    disabled?: boolean;
  }

  const actions: ToolbarAction[] = [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: onDuplicate,
      disabled: isElementLocked
    },
    {
      id: 'bring-forward',
      label: 'Bring Forward',
      icon: ArrowUp,
      onClick: onBringForward,
      disabled: isElementLocked
    },
    {
      id: 'send-backward',
      label: 'Send Backward', 
      icon: ArrowDown,
      onClick: onSendBackward,
      disabled: isElementLocked
    },
    {
      id: 'toggle-lock',
      label: isElementLocked ? 'Unlock' : 'Lock',
      icon: isElementLocked ? Unlock : Lock,
      onClick: onToggleLock
    }
  ];

  // Only show delete for deletable elements
  if (isDeletable) {
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      disabled: isElementLocked
    });
  }

  return (
    <div 
      className="absolute z-50 bg-white border border-border rounded-lg shadow-lg min-w-max"
      style={{ 
        left: position.x, 
        top: position.y - 50,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="flex items-center gap-1 p-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.id === 'delete' ? 'destructive' : 
                      action.id === 'toggle-lock' && isElementLocked ? 'default' : 'ghost'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-8 w-8 p-0"
              title={action.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Font Controls for Text Elements */}
      {isTextElement && !isElementLocked && fontSize && fontFamily && (
        <div className="border-t p-2 space-y-2">
          {/* Font Family */}
          <div className="flex items-center gap-2">
            <Type className="h-3 w-3 text-muted-foreground" />
            <Select 
              value={fontFamily} 
              onValueChange={onFontFamilyChange}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
                <ChevronDown className="h-3 w-3" />
              </SelectTrigger>
              <SelectContent className="max-h-40">
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Size</span>
            <Select 
              value={fontSize?.toString()} 
              onValueChange={(value) => onFontSizeChange?.(parseInt(value))}
            >
              <SelectTrigger className="h-7 text-xs w-16">
                <SelectValue />
                <ChevronDown className="h-3 w-3" />
              </SelectTrigger>
              <SelectContent>
                {[12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="text-xs">
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectToolbar;