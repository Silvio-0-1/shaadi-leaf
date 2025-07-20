import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Heart, Eye, Palette, Edit, Trash2 } from 'lucide-react';
import { Template } from '@/types';

interface PremiumTemplateCardProps {
  template: Template;
  onPreview: (template: Template) => void;
  onCustomize: (template: Template) => void;
  onFavorite?: (templateId: string) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (templateId: string) => void;
  isFavorite?: boolean;
  isAdmin?: boolean;
}

const PremiumTemplateCard = ({
  template,
  onPreview,
  onCustomize,
  onFavorite,
  onEdit,
  onDelete,
  isFavorite = false,
  isAdmin = false
}: PremiumTemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-500 hover:shadow-elegant hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-border/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* Template Thumbnail */}
        <img 
          src={template.thumbnail}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {template.isPremium && (
            <Badge className="bg-gradient-elegant text-white border-0 shadow-glow">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {template.category}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(template.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/20 backdrop-blur-sm transition-all duration-300 hover:bg-background/40"
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
            }`} 
          />
        </button>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="absolute top-3 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(template);
              }}
              className="p-2 rounded-full bg-background/20 backdrop-blur-sm transition-all duration-300 hover:bg-primary/20"
            >
              <Edit className="h-3 w-3 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(template.id);
              }}
              className="p-2 rounded-full bg-background/20 backdrop-blur-sm transition-all duration-300 hover:bg-destructive/20"
            >
              <Trash2 className="h-3 w-3 text-white" />
            </button>
          </div>
        )}

        {/* Hover Action Buttons */}
        <div className={`absolute inset-x-4 bottom-4 flex gap-2 transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className="flex-1 bg-background/90 backdrop-blur-sm hover:bg-background"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCustomize(template);
            }}
            className="flex-1 bg-gradient-elegant hover:opacity-90"
          >
            <Palette className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">
            {template.name}
          </h3>
          
          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {template.supportsMultiPhoto && (
              <Badge variant="outline" className="text-xs">Multi-Photo</Badge>
            )}
            {template.supportsVideo && (
              <Badge variant="outline" className="text-xs">Video</Badge>
            )}
            {template.layouts && template.layouts.length > 1 && (
              <Badge variant="outline" className="text-xs">Multiple Layouts</Badge>
            )}
          </div>

          {/* Color Palette Preview */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Colors:</span>
            <div className="flex gap-1">
              <div 
                className="w-3 h-3 rounded-full border border-border/50" 
                style={{ backgroundColor: template.colors.primary }}
              />
              <div 
                className="w-3 h-3 rounded-full border border-border/50" 
                style={{ backgroundColor: template.colors.secondary }}
              />
              <div 
                className="w-3 h-3 rounded-full border border-border/50" 
                style={{ backgroundColor: template.colors.accent }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumTemplateCard;