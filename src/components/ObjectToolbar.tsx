import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  RotateCcw,
  Grid,
  AlignCenter,
  AlignVerticalJustifyCenter,
  Move3D
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
  // Grid and alignment controls
  showGridlines?: boolean;
  onToggleGridlines?: () => void;
  snapToGrid?: boolean;
  onToggleSnapToGrid?: () => void;
  showAlignmentGuides?: boolean;
  onToggleAlignmentGuides?: () => void;
  snapToCenter?: boolean;
  onToggleSnapToCenter?: () => void;
  onCenterHorizontally?: () => void;
  onCenterVertically?: () => void;
  onCenterBoth?: () => void;
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
  onReset,
  showGridlines = false,
  onToggleGridlines,
  snapToGrid = false,
  onToggleSnapToGrid,
  showAlignmentGuides = true,
  onToggleAlignmentGuides,
  snapToCenter = true,
  onToggleSnapToCenter,
  onCenterHorizontally,
  onCenterVertically,
  onCenterBoth
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
      label: 'Reset Positions',
      icon: RotateCcw,
      onClick: onReset,
      disabled: false
    }
  ];

  // Element actions
  const elementActions = [
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
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 space-y-3">
      {/* Line 1: History Controls, Grid Controls, and Alignment Controls */}
      <div className="flex items-center justify-start gap-4 pb-2 border-b border-border">
        {/* History Controls */}
        <div className="flex items-center gap-1">
          {historyActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                disabled={action.disabled}
                className="h-9 w-9 p-0 hover:bg-accent"
                title={action.label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {/* Grid Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Grid Lines</span>
          <Switch
            checked={showGridlines}
            onCheckedChange={onToggleGridlines}
            className="data-[state=checked]:bg-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Snap Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Snap to Center</span>
          <Switch
            checked={snapToCenter}
            onCheckedChange={onToggleSnapToCenter}
            className="data-[state=checked]:bg-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Alignment Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCenterHorizontally?.();
            }}
            disabled={!hasSelection || isElementLocked}
            className="h-9 w-9 p-0 hover:bg-accent"
            title="Center Horizontally"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCenterVertically?.();
            }}
            disabled={!hasSelection || isElementLocked}
            className="h-9 w-9 p-0 hover:bg-accent"
            title="Center Vertically"
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCenterBoth?.();
            }}
            disabled={!hasSelection || isElementLocked}
            className="h-9 w-9 p-0 hover:bg-accent"
            title="Center Both Axes"
          >
            <Move3D className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Line 2: Element Actions & Font Controls */}
      <div className="flex items-center justify-start gap-4 pb-2 border-b border-border">
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
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                disabled={action.disabled}
                className="h-9 w-9 p-0 hover:bg-accent"
                title={action.label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {/* Font Controls for Text Elements */}
        <div className="flex items-center gap-2">
          {/* Font Family */}
          <div className="flex items-center gap-1">
            <Type className="h-4 w-4 text-muted-foreground" />
            <Select 
              value={fontFamily || 'Playfair Display'} 
              onValueChange={(value) => {
                onFontFamilyChange?.(value);
              }}
              disabled={!hasSelection || !isTextElement || isElementLocked}
            >
              <SelectTrigger 
                className="h-9 text-sm w-36 bg-background hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent 
                className="max-h-40 bg-background border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font} className="text-sm" style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground font-medium">Size</span>
            <Select 
              value={fontSize?.toString() || '16'} 
              onValueChange={(value) => onFontSizeChange?.(parseInt(value))}
              disabled={!hasSelection || !isTextElement || isElementLocked}
            >
              <SelectTrigger 
                className="h-9 text-sm w-20 bg-background hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent 
                className="bg-background border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                {[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 64, 68, 72, 80, 88, 96].map((size) => (
                  <SelectItem key={size} value={size.toString()} className="text-sm">
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Line 3: Selection Status */}
      <div className="flex items-center justify-start min-h-[28px]">
        {hasSelection ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Selected:</span>
            <Badge variant="secondary" className="text-sm px-3 py-1 font-medium">
              {getSelectedElementName()}
            </Badge>
            {isElementLocked && (
              <Badge variant="outline" className="text-sm px-2 py-1">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground font-medium">
            Click on an object to access tools
          </span>
        )}
      </div>
    </div>
  );
};

export default ObjectToolbar;