import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Type, Sparkles, Crown, Palette, RotateCcw } from 'lucide-react';
import { TemplateCustomization, Template } from '@/types';
import { templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';

interface PremiumFontEditorProps {
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  templateId: string;
}

const PremiumFontEditor = ({ customization, onCustomizationChange, templateId }: PremiumFontEditorProps) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;

      const staticTemplate = templates.find(t => t.id === templateId);
      if (staticTemplate) {
        setTemplate(staticTemplate);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('custom_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (!error && data) {
          const customTemplate: Template = {
            id: data.id,
            name: data.name,
            category: 'custom' as const,
            thumbnail: data.background_image || '/placeholder.svg',
            isPremium: data.is_premium,
            colors: data.colors as any,
            fonts: data.fonts as any,
            layouts: ['custom'],
            supportsMultiPhoto: true,
            supportsVideo: false,
            backgroundImage: data.background_image,
            defaultPositions: data.default_positions as any,
            tags: data.tags || []
          };
          setTemplate(customTemplate);
        }
      } catch (error) {
        console.error('Error fetching custom template:', error);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const fontCategories = {
    elegant: {
      name: 'Elegant Serif',
      icon: Crown,
      fonts: ['Playfair Display', 'Cormorant Garamond', 'Crimson Text', 'Libre Baskerville', 'Merriweather', 'Lora', 'Cinzel', 'Times New Roman', 'Georgia', 'Garamond']
    },
    romantic: {
      name: 'Romantic Script',
      icon: Sparkles,
      fonts: ['Dancing Script', 'Great Vibes', 'Pacifico', 'Alex Brush', 'Allura', 'Sacramento', 'Satisfy', 'Cookie', 'Kaushan Script', 'Caveat', 'Pinyon Script', 'Tangerine']
    },
    modern: {
      name: 'Modern Clean',
      icon: Type,
      fonts: ['Montserrat', 'Poppins', 'Inter', 'Work Sans', 'Raleway', 'Source Sans Pro', 'Roboto', 'Open Sans', 'Nunito', 'Quicksand', 'Comfortaa']
    },
    decorative: {
      name: 'Decorative',
      icon: Palette,
      fonts: ['Berkshire Swash', 'Mr Dafoe', 'Niconne', 'Petit Formal Script', 'Rochester', 'Italianno', 'Engagement', 'Clicker Script', 'Courgette', 'Grand Hotel', 'Lobster']
    }
  };

  const allFonts = Object.values(fontCategories).flatMap(category => category.fonts);
  const getFilteredFonts = () => {
    if (selectedCategory === 'all') return allFonts;
    return fontCategories[selectedCategory as keyof typeof fontCategories]?.fonts || [];
  };

  const updateFonts = useCallback((fontKey: string, value: string) => {
    const updatedCustomization = {
      ...customization,
      fonts: {
        ...customization.fonts,
        [fontKey]: value
      }
    };
    onCustomizationChange(updatedCustomization);
  }, [customization, onCustomizationChange]);

  const updateFontSize = useCallback((sizeKey: string, value: number) => {
    const updatedCustomization = {
      ...customization,
      fontSizes: {
        ...customization.fontSizes,
        [sizeKey]: value
      }
    };
    onCustomizationChange(updatedCustomization);
  }, [customization, onCustomizationChange]);

  const updateNamesSize = useCallback((value: number) => {
    const updatedCustomization = {
      ...customization,
      fontSizes: {
        ...customization.fontSizes,
        brideNameSize: value,
        groomNameSize: value
      }
    };
    onCustomizationChange(updatedCustomization);
  }, [customization, onCustomizationChange]);

  const resetToDefaults = () => {
    onCustomizationChange({ 
      ...customization,
      fonts: {},
      fontSizes: {}
    });
  };

  const textElements = [
    {
      key: 'heading',
      label: 'Bride & Groom Names',
      sizeKey: 'brideNameSize',
      defaultSize: 32,
      minSize: 16,
      maxSize: 72,
      step: 2,
      preview: 'Sarah & Michael',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      key: 'date',
      label: 'Wedding Date',
      sizeKey: 'dateSize',
      defaultSize: 24,
      minSize: 12,
      maxSize: 48,
      step: 2,
      preview: 'June 15, 2024',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'venue',
      label: 'Venue',
      sizeKey: 'venueSize',
      defaultSize: 20,
      minSize: 12,
      maxSize: 40,
      step: 2,
      preview: 'Garden Pavilion',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      key: 'message',
      label: 'Personal Message',
      sizeKey: 'messageSize',
      defaultSize: 16,
      minSize: 12,
      maxSize: 32,
      step: 1,
      preview: 'Join us as we begin our journey together...',
      gradient: 'from-purple-500 to-violet-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
            <Type className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Fonts & Sizes
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize typography to match your wedding style
        </p>
      </div>

      {/* Font Categories */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">Font Categories</Label>
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer transition-all hover:scale-105"
            onClick={() => setSelectedCategory('all')}
          >
            All Fonts
          </Badge>
          {Object.entries(fontCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <Badge 
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
                onClick={() => setSelectedCategory(key)}
              >
                <IconComponent className="h-3 w-3" />
                {category.name}
              </Badge>
            );
          })}
        </div>
      </Card>

      {/* Text Elements */}
      <div className="space-y-4">
        {textElements.map((element, index) => (
          <Card key={element.key} className="p-6 transition-all hover:shadow-md">
            <div className="space-y-4">
              {/* Element Header */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${element.gradient} bg-opacity-10`}>
                  <Type className={`h-4 w-4 text-transparent bg-gradient-to-r ${element.gradient} bg-clip-text`} />
                </div>
                <div>
                  <Label className="text-base font-medium">{element.label}</Label>
                  <p className="text-xs text-muted-foreground">Choose font and adjust size</p>
                </div>
              </div>

              {/* Font Selection */}
              <div className="space-y-3">
                <Select 
                  value={customization.fonts?.[element.key as keyof typeof customization.fonts] || (element.key === 'heading' ? 'Playfair Display' : 'Inter')} 
                  onValueChange={(value) => updateFonts(element.key, value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={`Select font for ${element.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {getFilteredFonts().map((font) => (
                      <SelectItem key={font} value={font}>
                        <div className="flex items-center justify-between w-full">
                          <span style={{ fontFamily: font }} className="text-sm">
                            {font}
                          </span>
                          <span className="text-xs text-muted-foreground ml-4" style={{ fontFamily: font }}>
                            Aa
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Live Preview */}
                <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <p 
                    className="text-center text-foreground transition-all"
                    style={{ 
                      fontFamily: customization.fonts?.[element.key as keyof typeof customization.fonts] || (element.key === 'heading' ? 'Playfair Display' : 'Inter'),
                      fontSize: `${customization.fontSizes?.[element.sizeKey as keyof typeof customization.fontSizes] || element.defaultSize}px`
                    }}
                  >
                    {element.preview}
                  </p>
                </div>

                {/* Size Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Font Size</span>
                    <Badge variant="secondary" className="text-xs">
                      {customization.fontSizes?.[element.sizeKey as keyof typeof customization.fontSizes] || element.defaultSize}px
                    </Badge>
                  </div>
                  <Slider
                    value={[customization.fontSizes?.[element.sizeKey as keyof typeof customization.fontSizes] || element.defaultSize]}
                    onValueChange={(value) => {
                      if (element.key === 'heading') {
                        updateNamesSize(value[0]);
                      } else {
                        updateFontSize(element.sizeKey, value[0]);
                      }
                    }}
                    min={element.minSize}
                    max={element.maxSize}
                    step={element.step}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{element.minSize}px</span>
                    <span>{element.maxSize}px</span>
                  </div>
                </div>
              </div>
            </div>
            {index < textElements.length - 1 && <Separator className="mt-6" />}
          </Card>
        ))}
      </div>

      {/* Reset Button */}
      <Card className="p-4">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="w-full h-12 text-base font-medium transition-all hover:scale-[1.02]"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default Fonts
        </Button>
      </Card>
    </div>
  );
};

export default PremiumFontEditor;