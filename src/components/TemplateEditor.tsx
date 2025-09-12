import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Sparkles, Frame, Palette } from 'lucide-react';
import { TemplateCustomization } from '@/types';

interface TemplateEditorProps {
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  templateId: string;
}

const TemplateEditor = ({ customization, onCustomizationChange, templateId }: TemplateEditorProps) => {
  const [activeTab, setActiveTab] = useState('fonts');

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

  // Text border update functions
  const updateTextBorder = <K extends keyof NonNullable<TemplateCustomization['textBorder']>>(
    key: K,
    value: NonNullable<TemplateCustomization['textBorder']>[K]
  ) => {
    const updatedCustomization = {
      ...customization,
      textBorder: {
        ...customization.textBorder,
        [key]: value
      }
    };
    onCustomizationChange(updatedCustomization);
  };

  const resetToDefaults = () => {
    onCustomizationChange({ 
      fonts: {},
      fontSizes: {},
      textBorder: { enabled: false }
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
          Customize fonts, sizes, and text borders for your wedding card
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fonts" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Fonts & Sizes
          </TabsTrigger>
          <TabsTrigger value="borders" className="flex items-center gap-2">
            <Frame className="h-4 w-4" />
            Text Borders
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

        <TabsContent value="borders" className="space-y-6">
          {/* Text Border Controls */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Frame className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">Text Border Settings</h3>
            </div>
            
            {/* Enable Text Borders */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Text Borders</Label>
                <p className="text-xs text-muted-foreground">Add decorative borders around text elements</p>
              </div>
              <Switch
                checked={customization.textBorder?.enabled || false}
                onCheckedChange={(checked) => updateTextBorder('enabled', checked)}
              />
            </div>

            {/* Border Settings - Only show if enabled */}
            {customization.textBorder?.enabled && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
                {/* Border Style */}
                <div className="space-y-2">
                  <Label>Border Style</Label>
                  <Select
                    value={customization.textBorder?.style || 'solid'}
                    onValueChange={(value) => updateTextBorder('style', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select border style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Width */}
                <div className="space-y-2">
                  <Label>Border Width: {customization.textBorder?.width || 2}px</Label>
                  <Slider
                    value={[customization.textBorder?.width || 2]}
                    onValueChange={(value) => updateTextBorder('width', value[0])}
                    max={8}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Border Shape */}
                <div className="space-y-2">
                  <Label>Border Shape</Label>
                  <Select
                    value={customization.textBorder?.shape || 'rounded'}
                    onValueChange={(value) => updateTextBorder('shape', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select border shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Border Color */}
                <div className="space-y-2">
                  <Label>Border Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={customization.textBorder?.color || '#ffffff'}
                      onChange={(e) => updateTextBorder('color', e.target.value)}
                      className="w-12 h-8 rounded border border-input cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">
                      {customization.textBorder?.color || '#ffffff'}
                    </span>
                  </div>
                </div>

                {/* Shadow Effect */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Shadow Effect</Label>
                    <p className="text-xs text-muted-foreground">Add a subtle shadow to text borders</p>
                  </div>
                  <Switch
                    checked={customization.textBorder?.shadow || false}
                    onCheckedChange={(checked) => updateTextBorder('shadow', checked)}
                  />
                </div>
              </div>
            )}
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