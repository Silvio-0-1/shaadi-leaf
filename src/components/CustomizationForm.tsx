import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Image, Crown, Type, Palette } from 'lucide-react';
import { WeddingCardData } from '@/types';
import MultiPhotoUpload from './MultiPhotoUpload';
import LogoUpload from './LogoUpload';
import TemplateEditor from './TemplateEditor';
import TextColorEditor from './TextColorEditor';
import BasicInfoForm from './BasicInfoForm';

interface CustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const CustomizationForm = ({ cardData, onDataChange }: CustomizationFormProps) => {
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

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Customize Your Card
        </h2>
        <p className="text-muted-foreground text-sm">
          Create your perfect wedding invitation with advanced customization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="basic" className="flex flex-col items-center space-y-1 h-full">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex flex-col items-center space-y-1 h-full">
            <Image className="h-4 w-4" />
            <span className="text-xs">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex flex-col items-center space-y-1 h-full">
            <Type className="h-4 w-4" />
            <span className="text-xs">Text Fonts</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex flex-col items-center space-y-1 h-full">
            <Palette className="h-4 w-4" />
            <span className="text-xs">Text Colors</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-0">
          <BasicInfoForm
            cardData={cardData}
            onDataChange={onDataChange}
            validationErrors={validationErrors}
            onValidationChange={handleValidationChange}
          />
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <TemplateEditor
            customization={cardData.customization || {}}
            onCustomizationChange={handleCustomizationChange}
            templateId={cardData.templateId}
          />
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <TextColorEditor
            customization={cardData.customization || {}}
            onCustomizationChange={handleCustomizationChange}
            templateId={cardData.templateId}
          />
        </TabsContent>
      </Tabs>

      {/* Form Info */}
      <div className="pt-6 border-t mt-6">
        <p className="text-xs text-muted-foreground text-center">
          Changes are automatically saved and reflected in the preview
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          * Required fields
        </p>
      </div>
    </Card>
  );
};

export default CustomizationForm;
