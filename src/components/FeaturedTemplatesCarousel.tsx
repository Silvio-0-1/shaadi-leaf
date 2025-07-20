import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Template } from '@/types';

interface FeaturedTemplatesCarouselProps {
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
}

const FeaturedTemplatesCarousel = ({ 
  templates, 
  onTemplateSelect 
}: FeaturedTemplatesCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get featured templates (premium ones or first few)
  const featuredTemplates = templates.filter(t => t.isPremium).slice(0, 5);
  
  useEffect(() => {
    if (featuredTemplates.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredTemplates.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredTemplates.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTemplates.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTemplates.length) % featuredTemplates.length);
  };

  if (featuredTemplates.length === 0) return null;

  const currentTemplate = featuredTemplates[currentIndex];

  return (
    <Card className="relative overflow-hidden bg-gradient-subtle border-border/50 shadow-elegant">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <CardContent className="relative p-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Featured Template</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-serif font-bold text-foreground">
                  {currentTemplate.name}
                </h2>
                {currentTemplate.isPremium && (
                  <Badge className="bg-gradient-elegant text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground text-lg">
                Create stunning wedding invitations with our most popular {currentTemplate.category} template.
                Perfect for modern couples looking for elegance and sophistication.
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {currentTemplate.supportsMultiPhoto && (
                  <Badge variant="secondary">Multi-Photo</Badge>
                )}
                {currentTemplate.supportsVideo && (
                  <Badge variant="secondary">Video Support</Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {currentTemplate.category}
                </Badge>
                {currentTemplate.layouts && currentTemplate.layouts.length > 1 && (
                  <Badge variant="secondary">
                    {currentTemplate.layouts.length} Layouts
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={() => onTemplateSelect(currentTemplate)}
                className="bg-gradient-elegant hover:opacity-90 text-white"
                size="lg"
              >
                Start Creating
              </Button>
            </div>
          </div>
          
          {/* Template Preview */}
          <div className="relative">
            <div className="aspect-[3/4] max-w-sm mx-auto relative group">
              <img 
                src={currentTemplate.thumbnail}
                alt={currentTemplate.name}
                className="w-full h-full object-cover rounded-lg shadow-elegant transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            </div>
            
            {/* Navigation */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSlide}
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSlide}
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {featuredTemplates.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary w-6' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedTemplatesCarousel;