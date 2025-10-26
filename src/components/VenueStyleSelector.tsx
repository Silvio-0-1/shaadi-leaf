import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { VENUE_STYLES, VenueStyle, getVenueStyleById } from '@/data/venueStyles';
import { cn } from '@/lib/utils';

interface VenueStyleSelectorProps {
  venue: string;
  selectedStyleId?: string;
  onStyleSelect: (styleId: string) => void;
}

const VenueStyleSelector = ({ venue, selectedStyleId, onStyleSelect }: VenueStyleSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!venue.trim()) return null;

  const selectedStyle = selectedStyleId ? getVenueStyleById(selectedStyleId) : null;

  const renderIconPreview = (style: VenueStyle, isSelected: boolean = false) => {
    const Icon = style.icon;
    
    return (
      <div className="flex items-center justify-center p-3">
        <Icon 
          className={cn(
            'transition-colors',
            isSelected ? 'text-primary' : 'text-muted-foreground'
          )} 
          size={style.iconSize} 
        />
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Location Icon
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {selectedStyle && (
          <Card className="p-2 bg-muted/50 border-primary/20">
            <div className="flex items-center gap-3">
              {renderIconPreview(selectedStyle, true)}
              <span className="text-sm font-medium text-foreground">
                {selectedStyle.name}
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Icon Options Grid */}
      {isExpanded && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-1">
          {VENUE_STYLES.map((style) => {
            const isSelected = selectedStyleId === style.id;
            
            return (
              <Card
                key={style.id}
                className={cn(
                  'cursor-pointer transition-all duration-200 hover:shadow-md border-2 relative group',
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => {
                  onStyleSelect(style.id);
                  setIsExpanded(false);
                }}
              >
                {renderIconPreview(style, isSelected)}
                {isSelected && (
                  <Check className="h-3 w-3 text-primary absolute top-1 right-1" />
                )}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10 shadow-md">
                  {style.name}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VenueStyleSelector;