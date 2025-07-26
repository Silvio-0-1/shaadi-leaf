import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Palette, Type, Save, Eye } from 'lucide-react';
import AuthRequiredModal from './AuthRequiredModal';
import { Template, CardElements } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CustomTemplateCreatorProps {
  onTemplateCreated: (template: Template) => void;
}

const CustomTemplateCreator = ({ onTemplateCreated }: CustomTemplateCreatorProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'custom' as const,
    backgroundImage: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#faf5ff',
    accentColor: '#a78bfa',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    isPremium: false
  });
  
  const [defaultPositions, setDefaultPositions] = useState<CardElements>({
    brideName: { x: 0, y: -40 },
    groomName: { x: 0, y: 40 },
    heartIcon: { x: 0, y: 0 },
    weddingDate: { x: 0, y: 120 },
    venue: { x: 0, y: 150 },
    message: { x: 0, y: 200 },
    photo: { 
      position: { x: 0, y: -120 },
      size: { width: 120, height: 120 }
    },
    logo: { x: 0, y: -180 },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTemplateData(prev => ({ ...prev, backgroundImage: result }));
        toast.success('Background image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePositionChange = (element: keyof CardElements, axis: 'x' | 'y', value: number) => {
    setDefaultPositions(prev => ({
      ...prev,
      [element]: element === 'photo' 
        ? {
            ...prev.photo,
            position: {
              ...prev.photo.position,
              [axis]: value
            }
          }
        : {
            ...prev[element],
            [axis]: value
          }
    }));
  };

  const handleCreateTemplate = async () => {
    if (!templateData.name) {
      toast.error('Please enter a template name');
      return;
    }
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .insert({
          name: templateData.name,
          category: 'custom',
          background_image: templateData.backgroundImage,
          created_by: user.id,
          colors: {
            primary: templateData.primaryColor,
            secondary: templateData.secondaryColor,
            accent: templateData.accentColor
          } as any,
          fonts: {
            heading: templateData.headingFont,
            body: templateData.bodyFont
          } as any,
          default_positions: defaultPositions as any,
          is_premium: templateData.isPremium
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        toast.error('Failed to create template. Please try again.');
        return;
      }

      const newTemplate: Template = {
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
        defaultPositions: data.default_positions as any
      };

      onTemplateCreated(newTemplate);
      toast.success('Custom template created successfully!');
      
      // Reset form
      setTemplateData({
        name: '',
        category: 'custom',
        backgroundImage: '',
        primaryColor: '#8b5cf6',
        secondaryColor: '#faf5ff',
        accentColor: '#a78bfa',
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
        isPremium: false
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template. Please try again.');
    }
  };

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

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Create Custom Template
        </h2>
        <p className="text-muted-foreground">
          Design your own wedding card template with custom background and positioning
        </p>
      </div>

      <div className="space-y-4">
        {/* Template Name */}
        <div className="space-y-2">
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            id="templateName"
            placeholder="Enter template name"
            value={templateData.name}
            onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {/* Background Image Upload */}
        <div className="space-y-2">
          <Label>Background Image</Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Background</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {templateData.backgroundImage && (
            <div className="mt-2">
              <img 
                src={templateData.backgroundImage} 
                alt="Background preview" 
                className="w-32 h-40 object-cover rounded border"
              />
            </div>
          )}
        </div>

        {/* Color Settings */}
        <div className="space-y-4">
          <Label className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-sm">Primary</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={templateData.primaryColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={templateData.primaryColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor" className="text-sm">Secondary</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={templateData.secondaryColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={templateData.secondaryColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor" className="text-sm">Accent</Label>
              <div className="flex space-x-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={templateData.accentColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={templateData.accentColor}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Font Settings */}
        <div className="space-y-4">
          <Label className="flex items-center">
            <Type className="h-4 w-4 mr-2" />
            Fonts
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heading Font</Label>
              <Select 
                value={templateData.headingFont} 
                onValueChange={(value) => setTemplateData(prev => ({ ...prev, headingFont: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
                value={templateData.bodyFont} 
                onValueChange={(value) => setTemplateData(prev => ({ ...prev, bodyFont: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
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
        </div>

        {/* Element Positioning */}
        <div className="space-y-4">
          <Label>Default Element Positions</Label>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(defaultPositions).map(([key, position]) => (
              <div key={key} className="space-y-2 p-3 border rounded">
                <Label className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`${key}-x`} className="text-xs">X Position</Label>
                    <Input
                      id={`${key}-x`}
                      type="number"
                      value={key === 'photo' ? position.position.x : position.x}
                      onChange={(e) => handlePositionChange(key as keyof CardElements, 'x', parseInt(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${key}-y`} className="text-xs">Y Position</Label>
                    <Input
                      id={`${key}-y`}
                      type="number"
                      value={key === 'photo' ? position.position.y : position.y}
                      onChange={(e) => handlePositionChange(key as keyof CardElements, 'y', parseInt(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Template Button */}
        <Button 
          onClick={handleCreateTemplate}
          className="w-full wedding-gradient text-white"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Create Template
        </Button>

        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          action="create templates"
        />
      </div>
    </Card>
  );
};

export default CustomTemplateCreator;
