import { useState, useMemo } from 'react';
import { useVenueIcons } from '@/hooks/useVenueIcons';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronDown, MapPin } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VenueStyleSelectorProps {
  venue: string;
  selectedIconId: string | null;
  onIconSelect: (iconId: string, iconPath: string, isFilled: boolean) => void;
}

const VenueStyleSelector = ({ venue, selectedIconId, onIconSelect }: VenueStyleSelectorProps) => {
  const [showFilled, setShowFilled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { venueIcons, isLoading } = useVenueIcons();


  // Map database categories to premium UI categories
  const categoryMapping: Record<string, string> = {
    'location': 'Minimal',
    'building': 'Decorative',
    'nature': 'Modern',
    'decorative': 'Gold & Premium'
  };

  // Filter icons by filled/outline preference
  const filteredIcons = useMemo(() => {
    const filtered = venueIcons.filter(icon => {
      // Check for invalid icon entries
      if (!icon || !icon.svg_path || !icon.name) {
        console.warn("⚠️ Invalid icon entry found:", icon);
        return false;
      }
      return icon.is_filled === showFilled;
    });
    
    return filtered;
  }, [venueIcons, showFilled]);

  // Group icons by mapped category
  const categorizedIcons = useMemo(() => {
    const categorized = filteredIcons.reduce((acc, icon) => {
      const mappedCategory = categoryMapping[icon.category] || 'Colorful';
      if (!acc[mappedCategory]) {
        acc[mappedCategory] = [];
      }
      acc[mappedCategory].push(icon);
      return acc;
    }, {} as Record<string, typeof venueIcons>);
    
    return categorized;
  }, [filteredIcons, categoryMapping]);

  // REMOVED: Early return that was blocking rendering
  // Now we just check if venue is empty to show a message
  
  // Define category order for consistent display
  const categoryOrder = ['Minimal', 'Decorative', 'Gold & Premium', 'Modern', 'Colorful'];

  const renderIconPreview = (icon: typeof venueIcons[0], isSelected: boolean = false) => {
    // Validate icon data
    if (!icon.svg_path) {
      console.error("❌ Missing SVG path for icon:", icon.name);
      return (
        <div className="relative group">
          <div className="aspect-square rounded-xl border-2 border-destructive bg-destructive/10 flex items-center justify-center p-4">
            <div className="text-xs text-destructive text-center">Icon unavailable</div>
          </div>
          <p className="text-xs text-center mt-2 font-medium text-destructive">{icon.name}</p>
        </div>
      );
    }

    // Use explicit HSL color values for maximum visibility
    const fillColor = isSelected ? 'hsl(221.2 83.2% 53.3%)' : 'hsl(222.2 84% 4.9%)';
    const strokeColor = isSelected ? 'hsl(221.2 83.2% 53.3%)' : 'hsl(222.2 84% 4.9%)';
    
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className={cn(
            "w-16 h-16 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
            "hover:border-primary hover:bg-primary/5 hover:shadow-md cursor-pointer",
            isSelected
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border bg-card"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            style={{
              fill: icon.is_filled ? fillColor : 'none',
              stroke: icon.is_filled ? 'none' : strokeColor,
              strokeWidth: icon.is_filled ? 0 : 2,
              strokeLinecap: 'round' as const,
              strokeLinejoin: 'round' as const,
            }}
          >
            <path d={icon.svg_path} />
          </svg>
        </div>
        <p className={cn(
          "text-[10px] text-center font-medium transition-colors duration-200 max-w-[64px] line-clamp-2",
          isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {icon.name}
        </p>
      </div>
    );
  };

  const selectedIcon = venueIcons.find(icon => icon.id === selectedIconId);

  // Show nothing if no venue entered
  if (!venue || !venue.trim()) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <CollapsibleTrigger className="w-full">
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300",
          "hover:border-primary/50 hover:bg-primary/5 cursor-pointer group",
          isOpen ? "border-primary bg-primary/5" : "border-border bg-card"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors duration-300",
              isOpen ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
            )}>
              <MapPin className={cn(
                "h-5 w-5 transition-colors duration-300",
                isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
            <div className="text-left">
              <h3 className={cn(
                "font-semibold text-sm transition-colors duration-300",
                isOpen ? "text-primary" : "text-foreground"
              )}>
                Venue Icon
              </h3>
              {selectedIcon && (
                <p className="text-xs text-muted-foreground mt-0.5">{selectedIcon.name}</p>
              )}
            </div>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 transition-all duration-300",
            isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="mt-4 p-6 rounded-lg border-2 border-border bg-gradient-to-br from-card to-muted/20 space-y-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 pb-4 border-b border-border">
            <Label htmlFor="icon-style" className={cn(
              "text-sm font-medium transition-colors duration-200",
              !showFilled ? "text-primary" : "text-muted-foreground"
            )}>
              Outline
            </Label>
            <Switch
              id="icon-style"
              checked={showFilled}
              onCheckedChange={setShowFilled}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="icon-style" className={cn(
              "text-sm font-medium transition-colors duration-200",
              showFilled ? "text-primary" : "text-muted-foreground"
            )}>
              Filled
            </Label>
          </div>

          {/* Icon Grid */}
          <div className="space-y-8">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="animate-pulse">Loading icons...</div>
              </div>
            ) : venueIcons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No venue icons available</p>
                <p className="text-sm mt-2">Icons need to be added to the database</p>
              </div>
            ) : filteredIcons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium">No {showFilled ? 'filled' : 'outline'} icons available</p>
                <p className="text-sm mt-2">Try switching to {showFilled ? 'outline' : 'filled'} icons</p>
              </div>
            ) : (
              <>
                {categoryOrder.map((category) => {
                  const icons = categorizedIcons[category];
                  if (!icons || icons.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3">
                          {category}
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {icons.map((icon) => (
                            <button
                              key={icon.id}
                              onClick={() => onIconSelect(icon.id, icon.svg_path, icon.is_filled)}
                              className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg venue-icon-item"
                            >
                              {renderIconPreview(icon, selectedIconId === icon.id)}
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Show debug info if no categories matched */}
                {Object.keys(categorizedIcons).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="font-medium">Category mismatch detected</p>
                    <p className="text-sm mt-2">
                      Available icons: {filteredIcons.length}, but no categories matched
                    </p>
                    <p className="text-xs mt-1 text-destructive">
                      Check database icon categories
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default VenueStyleSelector;