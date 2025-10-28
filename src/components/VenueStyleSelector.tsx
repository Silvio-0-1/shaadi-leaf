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
  const filteredIcons = useMemo(
    () => venueIcons.filter(icon => icon.is_filled === showFilled),
    [venueIcons, showFilled]
  );

  // Group icons by mapped category
  const categorizedIcons = useMemo(
    () => filteredIcons.reduce((acc, icon) => {
      const mappedCategory = categoryMapping[icon.category] || 'Colorful';
      if (!acc[mappedCategory]) {
        acc[mappedCategory] = [];
      }
      acc[mappedCategory].push(icon);
      return acc;
    }, {} as Record<string, typeof venueIcons>),
    [filteredIcons]
  );

  // Early return AFTER all hooks
  if (!venue.trim()) return null;

  // Define category order for consistent display
  const categoryOrder = ['Minimal', 'Decorative', 'Gold & Premium', 'Modern', 'Colorful'];

  const renderIconPreview = (icon: typeof venueIcons[0], isSelected: boolean = false) => {
    const iconColor = isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))';
    
    return (
      <div className="relative group">
        <div
          className={cn(
            "aspect-square rounded-xl border-2 transition-all duration-300 flex items-center justify-center p-4",
            "hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1",
            "cursor-pointer bg-card",
            isSelected
              ? "border-primary bg-primary/10 shadow-md scale-105"
              : "border-border"
          )}
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 transition-all duration-300"
            style={{
              fill: icon.is_filled ? iconColor : 'none',
              stroke: icon.is_filled ? 'none' : iconColor,
              strokeWidth: icon.is_filled ? 0 : 2,
              strokeLinecap: 'round' as const,
              strokeLinejoin: 'round' as const,
            }}
          >
            <path d={icon.svg_path} />
          </svg>
        </div>
        <p className={cn(
          "text-xs text-center mt-2 font-medium transition-colors duration-200",
          isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {icon.name}
        </p>
      </div>
    );
  };

  const selectedIcon = venueIcons.find(icon => icon.id === selectedIconId);

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
            ) : filteredIcons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {showFilled ? 'filled' : 'outline'} icons available
              </div>
            ) : (
              categoryOrder.map((category) => {
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {icons.map((icon) => (
                        <button
                          key={icon.id}
                          onClick={() => {
                            onIconSelect(icon.id, icon.svg_path, icon.is_filled);
                          }}
                          className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
                        >
                          {renderIconPreview(icon, selectedIconId === icon.id)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default VenueStyleSelector;
