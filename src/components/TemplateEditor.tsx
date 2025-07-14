
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Layout, Image, Sparkles } from 'lucide-react';
import { TemplateCustomization } from '@/types';

interface TemplateEditorProps {
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  templateId: string;
}

const TemplateEditor = ({ customization, onCustomizationChange, templateId }: TemplateEditorProps) => {
  const [activeTab, setActiveTab] = useState('colors');

  const backgroundPatterns = [
    { id: 'none', name: 'None', preview: 'bg-transparent' },
    { id: 'dots', name: 'Polka Dots', preview: 'romantic-pattern' },
    { id: 'floral', name: 'Floral', preview: 'bg-gradient-to-br from-rose-50 to-pink-50' },
    { id: 'geometric', name: 'Geometric', preview: 'bg-gradient-to-r from-purple-50 to-blue-50' },
    { id: 'vintage', name: 'Vintage', preview: 'bg-gradient-to-br from-amber-50 to-orange-50' },
    { id: 'modern', name: 'Modern Lines', preview: 'bg-gradient-to-r from-gray-50 to-slate-50' }
  ];

  const fontOptions = [
    'Playfair Display',
    'Dancing Script',
    'Cormorant Garamond',
    'Merriweather',
    'Montserrat',
    'Poppins',
    'Inter',
    'Work Sans'
  ];

  const layoutOptions = [
    { id: 'classic', name: 'Classic Center' },
    { id: 'split', name: 'Split Layout' },
    { id: 'modern', name: 'Modern Asymmetric' },
    { id: 'collage', name: 'Photo Collage' }
  ];

  const updateCustomization = (key: keyof TemplateCustomization, value: any) => {
    onCustomizationChange({
      ...customization,
      [key]: value
    });
  };

  const updateColors = (colorKey: string, value: string) => {
    updateCustomization('colors', {
      ...customization.colors,
      [colorKey]: value
    });
  };

  const updateFonts = (fontKey: string, value: string) => {
    updateCustomization('fonts', {
      ...customization.fonts,
      [fontKey]: value
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-xl font-semibold">Customize Your Template</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center space-x-1">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="fonts" className="flex items-center space-x-1">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Fonts</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center space-x-1">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="background" className="flex items-center space-x-1">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Background</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={customization.colors?.primary || '#d946ef'}
                  onChange={(e) => updateColors('primary', e.target.value)}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  type="text"
                  value={customization.colors?.primary || '#d946ef'}
                  onChange={(e) => updateColors('primary', e.target.value)}
                  className="flex-1"
                  placeholder="#d946ef"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={customization.colors?.secondary || '#fdf2f8'}
                  onChange={(e) => updateColors('secondary', e.target.value)}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  type="text"
                  value={customization.colors?.secondary || '#fdf2f8'}
                  onChange={(e) => updateColors('secondary', e.target.value)}
                  className="flex-1"
                  placeholder="#fdf2f8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={customization.colors?.accent || '#ec4899'}
                  onChange={(e) => updateColors('accent', e.target.value)}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  type="text"
                  value={customization.colors?.accent || '#ec4899'}
                  onChange={(e) => updateColors('accent', e.target.value)}
                  className="flex-1"
                  placeholder="#ec4899"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="text-color"
                  type="color"
                  value={customization.colors?.text || '#1f2937'}
                  onChange={(e) => updateColors('text', e.target.value)}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  type="text"
                  value={customization.colors?.text || '#1f2937'}
                  onChange={(e) => updateColors('text', e.target.value)}
                  className="flex-1"
                  placeholder="#1f2937"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select 
                value={customization.fonts?.heading || 'Playfair Display'} 
                onValueChange={(value) => updateFonts('heading', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select heading font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Body Font</Label>
              <Select 
                value={customization.fonts?.body || 'Inter'} 
                onValueChange={(value) => updateFonts('body', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {layoutOptions.map((layout) => (
              <button
                key={layout.id}
                onClick={() => updateCustomization('layout', layout.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  customization.layout === layout.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{layout.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {layout.id === 'classic' && 'Centered traditional layout'}
                  {layout.id === 'split' && 'Two-column design'}
                  {layout.id === 'modern' && 'Contemporary asymmetric'}
                  {layout.id === 'collage' && 'Multiple photo support'}
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="background" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {backgroundPatterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => updateCustomization('backgroundPattern', pattern.id)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  customization.backgroundPattern === pattern.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-full h-16 rounded mb-2 ${pattern.preview}`} />
                <div className="text-sm font-medium">{pattern.name}</div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t">
        <Button 
          onClick={() => onCustomizationChange({})}
          variant="outline" 
          className="w-full"
        >
          Reset to Default
        </Button>
      </div>
    </Card>
  );
};

export default TemplateEditor;
