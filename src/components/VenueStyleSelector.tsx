import { useState } from 'react';
import { useVenueIcons } from '@/hooks/useVenueIcons';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  const renderIconPreview = (icon: typeof venueIcons[0]) => {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            Venue Icon
          </label>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="icon-style" className="text-xs text-muted-foreground cursor-pointer">
            {showFilled ? 'Filled' : 'Outline'}
          </Label>
          <Switch
            id="icon-style"
            checked={showFilled}
            onCheckedChange={setShowFilled}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      <Select
        value={selectedIconId || undefined}
        onValueChange={(value) => {
          const icon = venueIcons.find(i => i.id === value);
          if (icon) {
            onIconSelect(icon.id, icon.svg_path, icon.is_filled);
          }
        }}
      >
        <SelectTrigger className="w-full h-12 bg-card border-border hover:border-primary/50 transition-all duration-200">
          <SelectValue>
            {selectedIcon ? (
              <div className="flex items-center gap-3">
                <div className="text-primary flex-shrink-0">
                  {renderIconPreview(selectedIcon)}
                </div>
                <span className="font-medium text-sm">{selectedIcon.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select an icon</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-[300px] z-50">
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading icons...</div>
          ) : filteredIcons.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No {showFilled ? 'filled' : 'outline'} icons available
            </div>
          ) : (
            filteredIcons.map((icon) => (
              <SelectItem
                key={icon.id}
                value={icon.id}
                className="cursor-pointer hover:bg-accent/10 focus:bg-accent/10"
              >
                <div className="flex items-center gap-3 py-1">
                  <div className={cn(
                    "flex-shrink-0 transition-colors",
                    selectedIconId === icon.id ? "text-primary" : "text-foreground"
                  )}>
                    {renderIconPreview(icon)}
                  </div>
                  <span className="font-medium text-sm">{icon.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VenueStyleSelector;
