export interface ElementState {
  id: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  rotation?: number;
  isLocked?: boolean;
  zIndex: number;
}

export interface ResizeHandle {
  direction: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
  cursor: string;
  position: string;
  proportional: boolean;
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'secondary';
}