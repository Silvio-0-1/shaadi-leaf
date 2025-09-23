
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Image, Palette, Type, Sparkles, Settings } from 'lucide-react';
import { WeddingCardData } from '@/types';
import MultiPhotoUpload from './MultiPhotoUpload';
import LogoUpload from './LogoUpload';
import TemplateEditor from './TemplateEditor';
import PremiumFontEditor from './PremiumFontEditor';
import TextColorEditor from './TextColorEditor';
import BasicInfoForm from './BasicInfoForm';

interface PremiumCustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const PremiumCustomizationForm = ({ cardData, onDataChange }: PremiumCustomizationFormProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  const handleValidationChange = (errors: Record<string, string>) => {
    setValidationErrors(errors);
  };

  const handleImagesChange = (images: string[]) => {
    onDataChange({ uploadedImages: images });
  };

  const handlePhotoShapeChange = (shape: 'square' | 'circle' | 'rounded') => {
    onDataChange({ 
      customization: {
        ...cardData.customization,
        photoShape: shape
      }
    });
  };

  const handleLogoChange = (logo: string) => {
    onDataChange({ logoImage: logo });
  };

  const handleCustomizationChange = (customization: any) => {
    onDataChange({ customization });
  };

  const tabConfig = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: Heart,
      description: 'Names, date & venue',
      color: 'bg-rose-500/10 text-rose-600 border-rose-200'
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      description: 'Upload & arrange',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200'
    },
    {
      id: 'design',
      label: 'Fonts & Sizes',
      icon: Type,
      description: 'Typography styling',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    },
    {
      id: 'colors',
      label: 'Text Colors',
      icon: Palette,
      description: 'Text colors',
      color: 'bg-green-500/10 text-green-600 border-green-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Usage Instructions */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="h-4 w-4 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">How to customize your card:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Drag</strong> any element to move it around</li>
              <li>• <strong>Double-click</strong> on text to edit it directly</li>
              <li>• <strong>Resize</strong> photos by dragging the corners</li>
              <li>• Use controls to undo, redo, or reset changes</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden bg-white border shadow-lg">
        {/* Simplified Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-lg text-foreground">
              Customize Card
            </h2>
          </div>
        </div>

      {/* Simplified Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex flex-col items-center justify-center gap-1 px-2 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          <TabsContent value="basic" className="space-y-0 mt-0">
            <BasicInfoForm
              cardData={cardData}
              onDataChange={onDataChange}
              validationErrors={validationErrors}
              onValidationChange={handleValidationChange}
            />
          </TabsContent>

          <TabsContent value="photos" className="space-y-0 mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Photo Gallery</h3>
              </div>
              
              <MultiPhotoUpload
                images={cardData.uploadedImages || []}
                onImagesChange={handleImagesChange}
                maxImages={4}
                photoShape={cardData.customization?.photoShape || 'rounded'}
                onPhotoShapeChange={handlePhotoShapeChange}
              />
              
              {/* Logo Upload Section */}
              <div className="border-t pt-6">
                <LogoUpload
                  logo={cardData.logoImage}
                  onLogoChange={handleLogoChange}
                />
              </div>
            </div>
          </TabsContent>


          <TabsContent value="design" className="space-y-0 mt-0">
            <PremiumFontEditor
              customization={cardData.customization || {}}
              onCustomizationChange={handleCustomizationChange}
              templateId={cardData.templateId}
            />
          </TabsContent>

          <TabsContent value="colors" className="space-y-0 mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Text Colors</h3>
              </div>
              
              <TextColorEditor
                customization={cardData.customization || {}}
                onCustomizationChange={handleCustomizationChange}
                templateId={cardData.templateId}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
      </Card>
    </div>
  );
};

export default PremiumCustomizationForm;
