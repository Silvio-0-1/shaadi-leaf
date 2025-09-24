import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Undo2, 
  Redo2, 
  Grid3x3, 
  AlignCenter, 
  Layers, 
  Lock, 
  Unlock,
  Trash2,
  RotateCcw,
  Copy,
  Eye,
  EyeOff,
  MousePointer2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PremiumDesignToolbarProps {
  selectedElement: string | null;
  isElementLocked: boolean;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  showGuides: boolean;
  isPreviewMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleGrid: () => void;
  onToggleGuides: () => void;
  onTogglePreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onReset: () => void;
  onCenter: () => void;
}

export const PremiumDesignToolbar: React.FC<PremiumDesignToolbarProps> = ({
  selectedElement,
  isElementLocked,
  canUndo,
  canRedo,
  showGrid,
  showGuides,
  isPreviewMode,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleGuides,
  onTogglePreview,
  onDuplicate,
  onDelete,
  onToggleLock,
  onReset,
  onCenter,
}) => {
  return (
    <div className="glassmorphism rounded-xl p-3 mx-4 mb-4 border golden-border">
      <div className="flex items-center gap-2 flex-wrap">
        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onUndo}
                disabled={!canUndo}
                className="h-8 w-8 p-0"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRedo}
                disabled={!canRedo}
                className="h-8 w-8 p-0"
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isPreviewMode ? "default" : "ghost"}
                size="sm" 
                onClick={onTogglePreview}
                className="h-8 w-8 p-0"
              >
                {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPreviewMode ? 'Exit Preview' : 'Preview Mode'}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGrid ? "default" : "ghost"}
                size="sm" 
                onClick={onToggleGrid}
                className="h-8 w-8 p-0"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGuides ? "default" : "ghost"}
                size="sm" 
                onClick={onToggleGuides}
                className="h-8 w-8 p-0"
              >
                <MousePointer2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Alignment Guides</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Element Controls */}
        {selectedElement && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {selectedElement.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Badge>
              
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onDuplicate}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onCenter}
                      className="h-8 w-8 p-0"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Center Element</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onToggleLock}
                      className={cn("h-8 w-8 p-0", isElementLocked && "text-amber-600")}
                    >
                      {isElementLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isElementLocked ? 'Unlock' : 'Lock'} Element
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onDelete}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Reset Control */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReset}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset Layout</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};