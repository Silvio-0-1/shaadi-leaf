import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useVenueIcons } from '@/hooks/useVenueIcons';
import { cn } from '@/lib/utils';

interface VenueStyleSelectorProps {
  venue: string;
  selectedIconId?: string;
  onIconSelect: (iconId: string) => void;
}

const VenueStyleSelector = ({ venue, selectedIconId, onIconSelect }: VenueStyleSelectorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { venueIcons, isLoading } = useVenueIcons();
  
  if (!venue.trim()) return null;

  const selectedIcon = venueIcons.find(icon => icon.id === selectedIconId);

  const renderIconPreview = (icon: typeof venueIcons[0], isSelected: boolean = false) => {
    return (
      <div className="flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-200">
        <svg
          viewBox="0 0 24 24"
          className={cn(
            'transition-all duration-300',
            isSelected ? 'text-primary drop-shadow-lg' : 'text-muted-foreground group-hover:text-primary'
          )}
          style={{
            width: '24px',
            height: '24px',
            fill: icon.is_filled ? 'currentColor' : 'none',
            stroke: icon.is_filled ? 'none' : 'currentColor',
            strokeWidth: icon.is_filled ? 0 : 2,
          }}
        >
          <path d={icon.svg_path} />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              Location Icon
            </label>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {selectedIcon && (
          <Card className="p-3 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              {renderIconPreview(selectedIcon, true)}
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {selectedIcon.name}
                </span>
                {selectedIcon.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedIcon.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Icon Options Grid */}
      {isExpanded && (
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading icons...</p>
            </div>
          ) : (
            <>
              {/* Category: Location Icons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Location Markers
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {venueIcons
                    .filter(icon => icon.category === 'location')
                    .map((icon) => {
                      const isSelected = selectedIconId === icon.id;
                      
                      return (
                        <Card
                          key={icon.id}
                          className={cn(
                            'cursor-pointer transition-all duration-300 hover:shadow-lg border-2 relative group',
                            'hover:scale-105 hover:-translate-y-1',
                            isSelected 
                              ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]' 
                              : 'border-border hover:border-primary/50 bg-card'
                          )}
                          onClick={() => onIconSelect(icon.id)}
                        >
                          {renderIconPreview(icon, isSelected)}
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-xl border">
                            {icon.name}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Category: Buildings */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Venue Buildings
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {venueIcons
                    .filter(icon => icon.category === 'building')
                    .map((icon) => {
                      const isSelected = selectedIconId === icon.id;
                      
                      return (
                        <Card
                          key={icon.id}
                          className={cn(
                            'cursor-pointer transition-all duration-300 hover:shadow-lg border-2 relative group',
                            'hover:scale-105 hover:-translate-y-1',
                            isSelected 
                              ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]' 
                              : 'border-border hover:border-primary/50 bg-card'
                          )}
                          onClick={() => onIconSelect(icon.id)}
                        >
                          {renderIconPreview(icon, isSelected)}
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-xl border">
                            {icon.name}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Category: Nature */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Natural Settings
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {venueIcons
                    .filter(icon => icon.category === 'nature')
                    .map((icon) => {
                      const isSelected = selectedIconId === icon.id;
                      
                      return (
                        <Card
                          key={icon.id}
                          className={cn(
                            'cursor-pointer transition-all duration-300 hover:shadow-lg border-2 relative group',
                            'hover:scale-105 hover:-translate-y-1',
                            isSelected 
                              ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]' 
                              : 'border-border hover:border-primary/50 bg-card'
                          )}
                          onClick={() => onIconSelect(icon.id)}
                        >
                          {renderIconPreview(icon, isSelected)}
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-xl border">
                            {icon.name}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>

              {/* Category: Decorative */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Decorative Icons
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {venueIcons
                    .filter(icon => icon.category === 'decorative')
                    .map((icon) => {
                      const isSelected = selectedIconId === icon.id;
                      
                      return (
                        <Card
                          key={icon.id}
                          className={cn(
                            'cursor-pointer transition-all duration-300 hover:shadow-lg border-2 relative group',
                            'hover:scale-105 hover:-translate-y-1',
                            isSelected 
                              ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.3)]' 
                              : 'border-border hover:border-primary/50 bg-card'
                          )}
                          onClick={() => onIconSelect(icon.id)}
                        >
                          {renderIconPreview(icon, isSelected)}
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-xl border">
                            {icon.name}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueStyleSelector;
