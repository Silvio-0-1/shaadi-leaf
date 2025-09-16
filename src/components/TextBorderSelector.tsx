import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextBorderConfiguration, TextBorderPreset, DEFAULT_TEXT_BORDER_PRESETS } from '@/types/textBorder';
import { Palette, Zap, Star, Sparkles } from 'lucide-react';

interface TextBorderSelectorProps {
  currentConfig?: TextBorderConfiguration;
  onConfigChange: (config: TextBorderConfiguration) => void;
  className?: string;
}

export const TextBorderSelector = ({ 
  currentConfig, 
  onConfigChange, 
  className = '' 
}: TextBorderSelectorProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(
    DEFAULT_TEXT_BORDER_PRESETS[0].id
  );

  const handlePresetSelect = (preset: TextBorderPreset) => {
    setSelectedPreset(preset.id);
    onConfigChange(preset.config);
  };

  const handleDisableBorder = () => {
    onConfigChange({
      enabled: false,
      style: {
        type: 'solid',
        width: 1,
        color: '#e2e8f0',
        opacity: 0.8,
        radius: 4,
        animation: 'none'
      }
    });
  };

  const getPresetIcon = (presetId: string) => {
    switch (presetId) {
      case 'elegant':
        return <Palette className="h-4 w-4" />;
      case 'modern':
        return <Zap className="h-4 w-4" />;
      case 'classic':
        return <Star className="h-4 w-4" />;
      case 'vibrant':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Text Border Styles
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Choose a border style for text elements (photos keep their own borders)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Disable Border Option */}
        <Button
          variant={!currentConfig?.enabled ? "default" : "outline"}
          size="sm"
          className="w-full justify-start text-xs"
          onClick={handleDisableBorder}
        >
          No Border (Default)
        </Button>

        {/* Preset Options */}
        <div className="space-y-2">
          {DEFAULT_TEXT_BORDER_PRESETS.map((preset) => (
            <div key={preset.id} className="space-y-2">
              <Button
                variant={selectedPreset === preset.id ? "default" : "outline"}
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => handlePresetSelect(preset)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {getPresetIcon(preset.id)}
                    {preset.name}
                  </div>
                  {preset.config.style.animation !== 'none' && (
                    <Badge variant="secondary" className="text-xs">
                      Animated
                    </Badge>
                  )}
                </div>
              </Button>
              
              {/* Preview */}
              <div className="ml-4 p-2 border rounded bg-muted/30">
                <div
                  className="text-xs font-medium text-center py-1 px-2 inline-block"
                  style={{
                    ...(preset.config.enabled && {
                      border: preset.config.style.type === 'solid' 
                        ? `${preset.config.style.width}px ${preset.config.style.type} ${preset.config.style.color}`
                        : preset.config.style.type === 'dashed'
                        ? `${preset.config.style.width}px dashed ${preset.config.style.color}`
                        : preset.config.style.type === 'dotted'
                        ? `${preset.config.style.width}px dotted ${preset.config.style.color}`
                        : preset.config.style.type === 'double'
                        ? `${preset.config.style.width}px double ${preset.config.style.color}`
                        : preset.config.style.type === 'glow'
                        ? `1px solid ${preset.config.style.color}`
                        : `${preset.config.style.width}px solid ${preset.config.style.color}`,
                      borderRadius: `${preset.config.style.radius}px`,
                      opacity: preset.config.style.opacity,
                      ...(preset.config.style.type === 'glow' && {
                        boxShadow: `0 0 ${preset.config.style.width * 2}px ${preset.config.style.color}`,
                      }),
                      ...(preset.config.style.type === 'gradient' && preset.config.gradient && {
                        background: `linear-gradient(${preset.config.gradient.direction}deg, ${preset.config.gradient.colors.join(', ')})`,
                        padding: `${preset.config.style.width}px`,
                        border: 'none',
                      }),
                      ...(preset.config.shadow && {
                        boxShadow: `${preset.config.shadow.offsetX}px ${preset.config.shadow.offsetY}px ${preset.config.shadow.blur}px ${preset.config.shadow.spread}px ${preset.config.shadow.color}`,
                      }),
                    }),
                  }}
                >
                  {preset.config.style.type === 'gradient' && preset.config.gradient ? (
                    <span
                      style={{
                        background: 'white',
                        borderRadius: `${Math.max(0, preset.config.style.radius - preset.config.style.width)}px`,
                        padding: '2px 6px',
                        display: 'inline-block',
                      }}
                    >
                      Sample Text
                    </span>
                  ) : (
                    'Sample Text'
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {preset.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Status */}
        {currentConfig && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current:</span>
              <Badge variant={currentConfig.enabled ? "default" : "secondary"}>
                {currentConfig.enabled 
                  ? `${currentConfig.style.type} border` 
                  : 'No border'
                }
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};