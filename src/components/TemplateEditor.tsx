
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Type className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-xl font-semibold">Font Customization</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Bride & Groom Names</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Wedding Date</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Venue</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Personal Message</Label>
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
