import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { TemplateCustomization, Template } from '@/types';
import { templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';

interface TextColorEditorProps {
  customization: TemplateCustomization;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  templateId: string;
}

const TextColorEditor = ({ customization, onCustomizationChange, templateId }: TextColorEditorProps) => {
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
      ...customization,
      textColors: {}
    });
  };

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <Palette className="h-5 w-5" />
          Text Colors
        </h2>
        <p className="text-muted-foreground text-sm">
          Customize the colors of your text elements
        </p>
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

export default TextColorEditor;