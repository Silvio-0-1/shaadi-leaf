import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Copy, 
  BringToFront, 
  SendToBack,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { ToolbarAction } from '@/types/editor';

interface ObjectToolbarProps {
  selectedElement: string | null;
  elementLocked: boolean;
  onDelete: (elementId: string) => void;
  onDuplicate: (elementId: string) => void;
  onBringToFront: (elementId: string) => void;
  onSendToBack: (elementId: string) => void;
  onToggleLock: (elementId: string) => void;
  position: { x: number; y: number };
  visible: boolean;
}

const ObjectToolbar = ({
  selectedElement,
  elementLocked,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  position,
  visible
}: ObjectToolbarProps) => {
  if (!visible || !selectedElement) return null;

  const actions: ToolbarAction[] = [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: () => {
        onDuplicate(selectedElement);
        toast.success('Element duplicated');
      }
    },
    {
      id: 'bringForward',
      label: 'Bring Forward',
      icon: BringToFront,
      onClick: () => {
        onBringToFront(selectedElement);
        toast.success('Brought to front');
      }
    },
    {
      id: 'sendBackward',
      label: 'Send Backward',
      icon: SendToBack,
      onClick: () => {
        onSendToBack(selectedElement);
        toast.success('Sent to back');
      }
    },
    {
      id: 'toggleLock',
      label: elementLocked ? 'Unlock' : 'Lock',
      icon: elementLocked ? Unlock : Lock,
      onClick: () => {
        onToggleLock(selectedElement);
        toast.success(elementLocked ? 'Element unlocked' : 'Element locked');
      },
      variant: elementLocked ? 'secondary' : 'default'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => {
        onDelete(selectedElement);
        toast.success('Element deleted');
      },
      variant: 'destructive'
    }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg p-2 flex items-center gap-1 animate-fade-in"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={action.variant as any || 'ghost'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
};

export default ObjectToolbar;