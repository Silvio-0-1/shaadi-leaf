import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
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

  const availableFonts = [
    'Playfair Display', 'Cormorant Garamond', 'Crimson Text', 'Libre Baskerville', 'Merriweather', 'Lora', 'Cinzel', 'Times New Roman', 'Georgia', 'Garamond',
    'Dancing Script', 'Great Vibes', 'Pacifico', 'Alex Brush', 'Allura', 'Sacramento', 'Satisfy', 'Cookie', 'Kaushan Script', 'Caveat', 'Pinyon Script', 'Tangerine',
    'Montserrat', 'Poppins', 'Inter', 'Work Sans', 'Raleway', 'Source Sans Pro', 'Roboto', 'Open Sans', 'Nunito', 'Quicksand', 'Comfortaa',
    'Berkshire Swash', 'Mr Dafoe', 'Niconne', 'Petit Formal Script', 'Rochester', 'Italianno', 'Engagement', 'Clicker Script', 'Courgette', 'Grand Hotel', 'Lobster'
  ];

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
      label: 'Names',
      sizeKey: 'brideNameSize',
      defaultSize: 32,
      minSize: 16,
      maxSize: 72,
      step: 2
    },
    {
      key: 'date',
      label: 'Date',
      sizeKey: 'dateSize',
      defaultSize: 24,
      minSize: 12,
      maxSize: 48,
      step: 2
    },
    {
      key: 'venue',
      label: 'Venue',
      sizeKey: 'venueSize',
      defaultSize: 20,
      minSize: 12,
      maxSize: 40,
      step: 2
    },
    {
      key: 'message',
      label: 'Message',
      sizeKey: 'messageSize',
      defaultSize: 16,
      minSize: 12,
      maxSize: 32,
      step: 1
    }
  ];

  return (
    <div className="space-y-4">
      {textElements.map((element) => (
        <Card key={element.key} className="p-4 border border-border/60 bg-card/50 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Element Label */}
            <Label className="text-sm font-medium text-foreground">{element.label}</Label>

            {/* Font Selection */}
            <Select 
              value={customization.fonts?.[element.key as keyof typeof customization.fonts] || (element.key === 'heading' ? 'Playfair Display' : 'Inter')} 
              onValueChange={(value) => updateFonts(element.key, value)}
            >
              <SelectTrigger className="h-11 bg-background/80 border-border/60 hover:border-border transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/60">
                {availableFonts.map((font) => (
                  <SelectItem key={font} value={font} className="hover:bg-accent/50">
                    <span style={{ fontFamily: font }} className="text-sm">
                      {font}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Size Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Size</span>
                <Badge variant="secondary" className="text-xs bg-secondary/60 text-secondary-foreground">
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
        </Card>
      ))}

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={resetToDefaults}
        className="w-full mt-6 bg-background/60 hover:bg-accent/60 border-border/60 transition-colors"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset Fonts
      </Button>
    </div>
  );
};

export default PremiumFontEditor;