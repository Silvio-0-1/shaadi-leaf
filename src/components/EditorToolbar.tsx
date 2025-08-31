import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Grid3X3, 
  Trash2, 
  BringToFront, 
  SendToBack, 
  Undo2, 
  Redo2, 
  RotateCcw,
  AlignCenter,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Copy,
  Clipboard
} from 'lucide-react';
import { toast } from 'sonner';

interface EditorToolbarProps {
  showGridlines: boolean;
  onToggleGridlines: () => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  showAlignmentGuides: boolean;
  onToggleAlignmentGuides: () => void;
  selectedElement: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onDeleteElement: (elementId: string) => void;
  onBringToFront: (elementId: string) => void;
  onSendToBack: (elementId: string) => void;
  onCenterHorizontally: (elementId: string) => void;
  onCenterVertically: (elementId: string) => void;
  onCenterBoth: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
}

const EditorToolbar = ({
  showGridlines,
  onToggleGridlines,
  snapToGrid,
  onToggleSnapToGrid,
  showAlignmentGuides,
  onToggleAlignmentGuides,
  selectedElement,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onDeleteElement,
  onBringToFront,
  onSendToBack,
  onCenterHorizontally,
  onCenterVertically,
  onCenterBoth,
  onDuplicateElement
}: EditorToolbarProps) => {
  
  const handleDeleteElement = () => {
    if (selectedElement) {
      onDeleteElement(selectedElement);
      toast.success('Element deleted');
    }
  };

  const handleBringToFront = () => {
    if (selectedElement) {
      onBringToFront(selectedElement);
      toast.success('Brought to front');
    }
  };

  const handleSendToBack = () => {
    if (selectedElement) {
      onSendToBack(selectedElement);
      toast.success('Sent to back');
    }
  };

  const handleCenterHorizontally = () => {
    if (selectedElement) {
      onCenterHorizontally(selectedElement);
      toast.success('Centered horizontally');
    }
  };

  const handleCenterVertically = () => {
    if (selectedElement) {
      onCenterVertically(selectedElement);
      toast.success('Centered vertically');
    }
  };

  const handleCenterBoth = () => {
    if (selectedElement) {
      onCenterBoth(selectedElement);
      toast.success('Centered both axes');
    }
  };

  const handleDuplicateElement = () => {
    if (selectedElement) {
      onDuplicateElement(selectedElement);
      toast.success('Element duplicated');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm">
      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={onReset}
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs"
          title="Reset to default positions"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Grid Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="gridlines"
            checked={showGridlines}
            onCheckedChange={onToggleGridlines}
          />
          <Label htmlFor="gridlines" className="text-xs font-medium cursor-pointer">
            <Grid3X3 className="h-3 w-3 inline mr-1" />
            Gridlines
          </Label>
        </div>
        
        {/* Hidden toggles - functionality remains active */}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Element Controls */}
      <div className="flex items-center gap-1">
        {selectedElement && (
          <>
            <Button
              onClick={handleCenterHorizontally}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Center horizontally"
            >
              <AlignHorizontalJustifyCenter className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCenterVertically}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Center vertically"
            >
              <AlignVerticalJustifyCenter className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCenterBoth}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Center both axes"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-4 mx-1" />
            
            <Button
              onClick={handleDuplicateElement}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Duplicate element"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleBringToFront}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Bring to front"
            >
              <BringToFront className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendToBack}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Send to back"
            >
              <SendToBack className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleDeleteElement}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete element"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {!selectedElement && (
          <div className="text-xs text-muted-foreground px-2">
            Select an element to access tools
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar;