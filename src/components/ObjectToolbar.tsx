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
  ChevronDown,
  Undo,
  Redo,
  RotateCcw
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
  // History controls
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
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
  onFontFamilyChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onReset
}: ObjectToolbarProps) => {
  if (!visible) return null;
  
  const hasSelection = !!selectedElement;

  // Determine element type
  const isTextElement = selectedElement ? ['brideName', 'groomName', 'weddingDate', 'venue', 'message'].includes(selectedElement) : false;
  const isPhotoElement = selectedElement ? selectedElement.startsWith('photo') : false;
  const isDeletable = selectedElement ? !['brideName', 'groomName'].includes(selectedElement) : false;

  const fontOptions = [
    'Playfair Display', 'Cormorant Garamond', 'Crimson Text', 'Libre Baskerville',
    'Merriweather', 'Lora', 'Cinzel', 'Dancing Script', 'Great Vibes', 'Pacifico',
    'Alex Brush', 'Allura', 'Sacramento', 'Montserrat', 'Poppins', 'Inter'
  ];

  // Get selected element display name
  const getSelectedElementName = () => {
    if (!selectedElement) return null;
    
    switch (selectedElement) {
      case 'brideName': return 'Bride Name';
      case 'groomName': return 'Groom Name';
      case 'weddingDate': return 'Wedding Date';
      case 'venue': return 'Venue';
      case 'message': return 'Personal Message';
      case 'heartIcon': return 'Heart Icon';
      case 'photo': return 'Main Photo';
      case 'logo': return 'Logo';
      default:
        if (selectedElement.startsWith('photo-')) {
          return `Photo ${selectedElement.replace('photo-', '')}`;
        }
        return selectedElement;
    }
  };

  // History controls
  const historyActions = [
    {
      id: 'undo',
      label: 'Undo',
      icon: Undo,
      onClick: onUndo,
      disabled: !canUndo
    },
    {
      id: 'redo',
      label: 'Redo',
      icon: Redo,
      onClick: onRedo,
      disabled: !canRedo
    },
    {
      id: 'reset',
      label: 'Reset',
      icon: RotateCcw,
      onClick: onReset,
      disabled: false
    }
  ];

  // Element actions
  const elementActions = [
    {
      id: 'duplicate',
      label: 'Copy',
      icon: Copy,
      onClick: onDuplicate,
      disabled: !hasSelection || isElementLocked
    },
    {
      id: 'bring-forward',
      label: 'Bring Forward',
      icon: ArrowUp,
      onClick: onBringForward,
      disabled: !hasSelection || isElementLocked
    },
    {
      id: 'send-backward',
      label: 'Send Backward', 
      icon: ArrowDown,
      onClick: onSendBackward,
      disabled: !hasSelection || isElementLocked
    },
    {
      id: 'toggle-lock',
      label: isElementLocked ? 'Unlock' : 'Lock',
      icon: isElementLocked ? Unlock : Lock,
      onClick: onToggleLock,
      disabled: !hasSelection
    }
  ];

  // Add delete action for deletable elements
  if (isDeletable && hasSelection) {
    elementActions.push({
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      disabled: !hasSelection || isElementLocked
    });
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-4">
        {/* Column 1: History Controls */}
        <div className="flex items-center gap-1 border-r pr-4">
          {historyActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
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

        {/* Column 2: Element Actions & Font Controls */}
        <div className="flex items-center gap-3 border-r pr-4">
          {/* Element Actions */}
          <div className="flex items-center gap-1">
            {elementActions.map((action) => {
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
            <div className="flex items-center gap-2 border-l pl-3">
              {/* Font Family */}
              <div className="flex items-center gap-1">
                <Type className="h-3 w-3 text-muted-foreground" />
                <Select 
                  value={fontFamily} 
                  onValueChange={onFontFamilyChange}
                >
                  <SelectTrigger className="h-8 text-xs w-32 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-40 bg-background border border-border">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Size</span>
                <Select 
                  value={fontSize?.toString()} 
                  onValueChange={(value) => onFontSizeChange?.(parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs w-16 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border">
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

        {/* Column 3: Selection Status */}
        <div className="flex items-center">
          {hasSelection ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getSelectedElementName()}
              </Badge>
              {isElementLocked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Click on an object to access tools
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectToolbar;