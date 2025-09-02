
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Type, Sparkles } from 'lucide-react';
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

  return (
    <Card className="p-6 space-y-6">
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

      <div className="pt-4 border-t">
        <Button 
          onClick={() => onCustomizationChange({ fonts: {} })}
          variant="outline" 
          className="w-full"
        >
          Reset Fonts to Default
        </Button>
      </div>
    </Card>
  );
};

export default TemplateEditor;
