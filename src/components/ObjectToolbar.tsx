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
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-sm p-2 space-y-2">
      {/* Line 1: History & Grid/Snap Controls (Compact) */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/50">
        {/* History Controls */}
        <div className="flex items-center gap-0.5">
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
                className="h-7 w-7 p-0 hover:bg-accent"
                title={action.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            );
          })}
        </div>

        {/* Grid & Snap Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Grid</span>
            <Switch
              checked={showGridlines}
              onCheckedChange={onToggleGridlines}
              className="data-[state=checked]:bg-primary scale-75"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Snap</span>
            <Switch
              checked={snapToCenter}
              onCheckedChange={onToggleSnapToCenter}
              className="data-[state=checked]:bg-blue-500 scale-75"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      {/* Line 2: Alignment & Element Actions */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-border/50">
        {/* Alignment Controls */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCenterHorizontally?.();
            }}
            disabled={!hasSelection || isElementLocked}
            className="h-7 w-7 p-0 hover:bg-accent"
            title="Center Horizontally"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCenterVertically?.();
            }}
            disabled={!hasSelection || isElementLocked}
            className="h-7 w-7 p-0 hover:bg-accent"
            title="Center Vertically"
          >
            <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCenterBoth?.();
            }}
            disabled={!hasSelection || isElementLocked}
            className="h-7 w-7 p-0 hover:bg-accent"
            title="Center Both"
          >
            <Move3D className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Element Actions */}
        <div className="flex items-center gap-0.5">
          {elementActions.map((action) => {
            const Icon = action.icon;
            const isLockButton = action.id === 'toggle-lock';
            const isLocked = isLockButton && isElementLocked;
            
            return (
              <Button
                key={action.id}
                variant={action.id === 'delete' ? 'destructive' : 
                        isLocked ? 'default' : 'ghost'}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                disabled={action.disabled}
                className={`h-7 w-7 p-0 ${isLocked ? 'hover:bg-primary/80' : 'hover:bg-accent'}`}
                title={action.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Line 3: Font Controls (Compact) */}
      {isTextElement && hasSelection && (
        <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/50">
          <Type className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <Select 
            value={fontFamily || 'Playfair Display'} 
            onValueChange={(value) => {
              onFontFamilyChange?.(value);
            }}
            disabled={isElementLocked}
            onOpenChange={(open) => {
              if (open) {
                document.addEventListener('click', (e) => e.stopPropagation(), { capture: true, once: true });
              }
            }}
          >
            <SelectTrigger 
              className="h-7 text-xs flex-1 min-w-0 bg-background hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent 
              className="max-h-40 bg-background border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {fontOptions.map((font) => (
                <SelectItem 
                  key={font} 
                  value={font} 
                  className="text-xs" 
                  style={{ fontFamily: font }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={fontSize?.toString() || '16'} 
            onValueChange={(value) => onFontSizeChange?.(parseInt(value))}
            disabled={isElementLocked}
            onOpenChange={(open) => {
              if (open) {
                document.addEventListener('click', (e) => e.stopPropagation(), { capture: true, once: true });
              }
            }}
          >
            <SelectTrigger 
              className="h-7 text-xs w-16 bg-background hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent 
              className="bg-background border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              {[10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 64, 68, 72, 80, 88, 96].map((size) => (
                <SelectItem 
                  key={size} 
                  value={size.toString()} 
                  className="text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Line 4: Selection Status (Compact) */}
      <div className="flex items-center justify-start min-h-[24px]">
        {hasSelection ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Selected:</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
              {getSelectedElementName()}
            </Badge>
            {isElementLocked && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                <Lock className="h-2.5 w-2.5 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            Click on an element to edit
          </span>
        )}
      </div>
    </div>
  );
};

export default ObjectToolbar;