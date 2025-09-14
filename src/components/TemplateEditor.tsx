import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Sparkles, Palette } from 'lucide-react';
import { TemplateCustomization, Template } from '@/types';
import { templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';

interface TemplateEditorProps {
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  templateId: string;
}

const TemplateEditor = ({ customization, onCustomizationChange, templateId }: TemplateEditorProps) => {
  const [activeTab, setActiveTab] = useState('fonts');
  const [template, setTemplate] = useState<Template | null>(null);

  // Fetch template data to get default colors
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;

      // First check static templates
      const staticTemplate = templates.find(t => t.id === templateId);
      if (staticTemplate) {
        setTemplate(staticTemplate);
        return;
      }

      // Then check custom templates
      try {
        const { data, error } = await supabase
          .from('custom_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (error) {
          console.error('Error fetching custom template:', error);
          setTemplate(null);
        } else {
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
        setTemplate(null);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const fontOptions = [
    // Classic Wedding Fonts
    'Playfair Display',
    'Cormorant Garamond',
    'Crimson Text',
    'Libre Baskerville',
    'Merriweather',
    'Lora',
    'Cinzel',
    
    // Romantic Script Fonts
    'Dancing Script',
    'Great Vibes',
    'Pacifico',
    'Alex Brush',
    'Allura',
    'Sacramento',
    'Satisfy',
    'Cookie',
    'Kaushan Script',
    'Caveat',
    'Amatic SC',
    'Pinyon Script',
    'Tangerine',
    'Euphoria Script',
    'Bilbo Swash Caps',
    'Rouge Script',
    'Marck Script',
    'Yellowtail',
    'Homemade Apple',
    'La Belle Aurore',
    
    // Elegant Serif Fonts
    'Trajan Pro',
    'Optima',
    'Times New Roman',
    'Georgia',
    'Garamond',
    'Minion Pro',
    'Caslon',
    'Baskerville',
    'Didot',
    'Bodoni',
    
    // Modern Sans-Serif
    'Montserrat',
    'Poppins',
    'Inter',
    'Work Sans',
    'Raleway',
    'Source Sans Pro',
    'Roboto',
    'Open Sans',
    'Nunito',
    'Quicksand',
    'Comfortaa',
    'Lobster',
    
    // Decorative Wedding Fonts
    'Berkshire Swash',
    'Mr Dafoe',
    'Niconne',
    'Petit Formal Script',
    'Rochester',
    'Italianno',
    'Engagement',
    'Clicker Script',
    'Courgette',
    'Grand Hotel'
  ];

  const updateFonts = (fontKey: string, value: string) => {
    const updatedCustomization = {
      ...customization,
      fonts: {
        ...customization.fonts,
        [fontKey]: value
      }
    };
    onCustomizationChange(updatedCustomization);
  };

  const updateFontSize = (sizeKey: string, value: number) => {
    const updatedCustomization = {
      ...customization,
      fontSizes: {
        ...customization.fontSizes,
        [sizeKey]: value
      }
    };
    onCustomizationChange(updatedCustomization);
  };

  const updateTextColor = (colorKey: string, value: string) => {
    const updatedCustomization = {
      ...customization,
      textColors: {
        ...customization.textColors,
        [colorKey]: value
      }
    };
    onCustomizationChange(updatedCustomization);
  };

  // Get effective color (custom color or template default)
  const getEffectiveColor = (textType: string) => {
    const customColor = customization.textColors?.[textType as keyof typeof customization.textColors];
    if (customColor) return customColor;

    // Return template defaults based on text type
    if (textType === 'brideName' || textType === 'groomName') {
      return template?.colors?.primary || '#8B5A3C';
    } else {
      return template?.colors?.secondary || '#2C1810';
    }
  };

  const resetToDefaults = () => {
    onCustomizationChange({ 
      fonts: {},
      fontSizes: {},
      textColors: {}
    });
  };

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <Type className="h-5 w-5" />
          Font & Text Styling
        </h2>
        <p className="text-muted-foreground text-sm">
          Customize fonts, sizes, and colors for your wedding card
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fonts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Fonts & Sizes
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Text Colors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fonts" className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Bride & Groom Names</Label>
              <div className="space-y-2">
                <Select 
                  value={customization.fonts?.heading || 'Playfair Display'} 
                  onValueChange={(value) => updateFonts('heading', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font for names" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Font Size</span>
                    <span>{customization.fontSizes?.headingSize || 32}px</span>
                  </div>
                  <Slider
                    value={[customization.fontSizes?.headingSize || 32]}
                    onValueChange={(value) => updateFontSize('headingSize', value[0])}
                    min={16}
                    max={72}
                    step={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Wedding Date</Label>
              <div className="space-y-2">
                <Select 
                  value={customization.fonts?.date || customization.fonts?.body || 'Inter'} 
                  onValueChange={(value) => updateFonts('date', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font for date" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Font Size</span>
                    <span>{customization.fontSizes?.dateSize || 24}px</span>
                  </div>
                  <Slider
                    value={[customization.fontSizes?.dateSize || 24]}
                    onValueChange={(value) => updateFontSize('dateSize', value[0])}
                    min={12}
                    max={48}
                    step={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Venue</Label>
              <div className="space-y-2">
                <Select 
                  value={customization.fonts?.venue || customization.fonts?.body || 'Inter'} 
                  onValueChange={(value) => updateFonts('venue', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font for venue" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Font Size</span>
                    <span>{customization.fontSizes?.venueSize || 20}px</span>
                  </div>
                  <Slider
                    value={[customization.fontSizes?.venueSize || 20]}
                    onValueChange={(value) => updateFontSize('venueSize', value[0])}
                    min={12}
                    max={40}
                    step={2}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Personal Message</Label>
              <div className="space-y-2">
                <Select 
                  value={customization.fonts?.message || customization.fonts?.body || 'Inter'} 
                  onValueChange={(value) => updateFonts('message', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font for message" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Font Size</span>
                    <span>{customization.fontSizes?.messageSize || 16}px</span>
                  </div>
                  <Slider
                    value={[customization.fontSizes?.messageSize || 16]}
                    onValueChange={(value) => updateFontSize('messageSize', value[0])}
                    min={12}
                    max={32}
                    step={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Text Color Settings</h3>
            </div>
            
            <div className="space-y-4">
              {/* Bride Name Color */}
              <div className="space-y-2">
                <Label>Bride Name Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={getEffectiveColor('brideName')}
                    onChange={(e) => updateTextColor('brideName', e.target.value)}
                    className="w-12 h-8 rounded border border-input cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {getEffectiveColor('brideName')}
                  </span>
                </div>
              </div>

              {/* Groom Name Color */}
              <div className="space-y-2">
                <Label>Groom Name Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={getEffectiveColor('groomName')}
                    onChange={(e) => updateTextColor('groomName', e.target.value)}
                    className="w-12 h-8 rounded border border-input cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {getEffectiveColor('groomName')}
                  </span>
                </div>
              </div>

              {/* Date Color */}
              <div className="space-y-2">
                <Label>Wedding Date Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={getEffectiveColor('date')}
                    onChange={(e) => updateTextColor('date', e.target.value)}
                    className="w-12 h-8 rounded border border-input cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {getEffectiveColor('date')}
                  </span>
                </div>
              </div>

              {/* Venue Color */}
              <div className="space-y-2">
                <Label>Venue Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={getEffectiveColor('venue')}
                    onChange={(e) => updateTextColor('venue', e.target.value)}
                    className="w-12 h-8 rounded border border-input cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {getEffectiveColor('venue')}
                  </span>
                </div>
              </div>

              {/* Message Color */}
              <div className="space-y-2">
                <Label>Personal Message Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={getEffectiveColor('message')}
                    onChange={(e) => updateTextColor('message', e.target.value)}
                    className="w-12 h-8 rounded border border-input cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {getEffectiveColor('message')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      <div className="mt-6 pt-4 border-t">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="w-full"
        >
          Reset to Default
        </Button>
      </div>
    </Card>
  );
};

export default TemplateEditor;