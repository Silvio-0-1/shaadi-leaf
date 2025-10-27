import { useState } from 'react';
import { useVenueIcons } from '@/hooks/useVenueIcons';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface VenueStyleSelectorProps {
  venue: string;
  selectedIconId: string | null;
  onIconSelect: (iconId: string, iconPath: string, isFilled: boolean) => void;
}

const VenueStyleSelector = ({ venue, selectedIconId, onIconSelect }: VenueStyleSelectorProps) => {
  const [showFilled, setShowFilled] = useState(false);
  const { venueIcons, isLoading } = useVenueIcons();

  if (!venue.trim()) return null;

  // Filter icons by filled/outline preference
  const filteredIcons = venueIcons.filter(icon => icon.is_filled === showFilled);

  // Group icons by category
  const categorizedIcons = filteredIcons.reduce((acc, icon) => {
    const category = icon.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(icon);
    return acc;
  }, {} as Record<string, typeof venueIcons>);

  const renderIconPreview = (icon: typeof venueIcons[0], size: 'sm' | 'md' = 'sm') => {
    return (
      <svg
        viewBox="0 0 24 24"
        className={cn(
          size === 'sm' ? "w-5 h-5" : "w-6 h-6",
          "transition-transform group-hover:scale-110"
        )}
        fill={icon.is_filled ? "currentColor" : "none"}
        stroke={icon.is_filled ? "none" : "currentColor"}
        strokeWidth={icon.is_filled ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={icon.svg_path} />
      </svg>
    );
  };

  const selectedIcon = venueIcons.find(icon => icon.id === selectedIconId);
  
  const categoryNames: Record<string, string> = {
    'location': 'Location Markers',
    'venue': 'Venue Buildings',
    'nature': 'Natural Settings',
    'decorative': 'Decorative Icons'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Venue Icon
        </label>
        <div className="flex items-center gap-3">
          <Label htmlFor="icon-style" className="text-xs font-medium text-muted-foreground">
            Outline
          </Label>
          <Switch
            id="icon-style"
            checked={showFilled}
            onCheckedChange={setShowFilled}
            className="data-[state=checked]:bg-primary"
          />
          <Label htmlFor="icon-style" className="text-xs font-medium text-muted-foreground">
            Filled
          </Label>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-14 justify-between bg-card border-border hover:border-primary/50 transition-all duration-200",
              "hover:bg-accent/5 group"
            )}
          >
            {selectedIcon ? (
              <div className="flex items-center gap-3">
                <div className="text-primary flex-shrink-0">
                  {renderIconPreview(selectedIcon, 'md')}
                </div>
                <span className="font-medium text-sm">{selectedIcon.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select an icon</span>
            )}
            <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[600px] p-0 bg-popover border-border shadow-xl" 
          align="start"
          sideOffset={8}
        >
          <ScrollArea className="h-[500px]">
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading icons...</div>
              ) : filteredIcons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No {showFilled ? 'filled' : 'outline'} icons available
                </div>
              ) : (
                Object.entries(categorizedIcons).map(([category, icons]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      {categoryNames[category] || category}
                    </h3>
                    <div className="grid grid-cols-6 gap-3">
                      {icons.map((icon) => (
                        <button
                          key={icon.id}
                          onClick={() => {
                            onIconSelect(icon.id, icon.svg_path, icon.is_filled);
                          }}
                          className={cn(
                            "group relative aspect-square rounded-lg border-2 transition-all duration-200",
                            "hover:border-primary hover:bg-accent/10 hover:shadow-lg",
                            "flex items-center justify-center",
                            selectedIconId === icon.id
                              ? "border-primary bg-primary/10 shadow-md"
                              : "border-border bg-card"
                          )}
                          title={icon.name}
                        >
                          <div className={cn(
                            "transition-colors",
                            selectedIconId === icon.id ? "text-primary" : "text-foreground group-hover:text-primary"
                          )}>
                            {renderIconPreview(icon, 'md')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VenueStyleSelector;
