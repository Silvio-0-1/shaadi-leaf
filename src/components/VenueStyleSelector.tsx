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

  const renderVenuePreview = (style: VenueStyle, isSelected: boolean = false) => {
    const Icon = style.icon;
    
    const getFlexDirection = () => {
      switch (style.alignment) {
        case 'top': return 'flex-col';
        case 'bottom': return 'flex-col-reverse';
        case 'right': return 'flex-row-reverse';
        default: return 'flex-row';
      }
    };

    const getAlignment = () => {
      switch (style.alignment) {
        case 'top':
        case 'bottom': return 'items-center text-center';
        default: return 'items-center';
      }
    };

    return (
      <div 
        className={cn(
          'flex',
          getFlexDirection(),
          getAlignment(),
          style.spacing
        )}
      >
        <Icon 
          className={cn(
            'text-muted-foreground flex-shrink-0',
            isSelected ? 'text-primary' : ''
          )} 
          size={style.iconSize} 
        />
        <span 
          className={cn(
            style.fontSize,
            style.fontWeight,
            style.textTransform,
            style.letterSpacing,
            'text-foreground truncate',
            isSelected ? 'text-primary' : ''
          )}
        >
          {venue}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Current Selection Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Venue Style
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
          <Card className="p-3 bg-muted/50 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {renderVenuePreview(selectedStyle, true)}
              </div>
              <Badge variant="secondary" className="ml-2 text-xs">
                {selectedStyle.name}
              </Badge>
            </div>
          </Card>
        )}
      </div>

      {/* Style Options Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {VENUE_STYLES.map((style) => {
            const isSelected = selectedStyleId === style.id;
            
            return (
              <Card
                key={style.id}
                className={cn(
                  'p-3 cursor-pointer transition-all duration-200 hover:shadow-md border-2',
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => {
                  onStyleSelect(style.id);
                  setIsExpanded(false);
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">
                      {style.name}
                    </h4>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {style.description}
                  </p>
                  
                  <div className="flex justify-center py-2">
                    {renderVenuePreview(style)}
                  </div>
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