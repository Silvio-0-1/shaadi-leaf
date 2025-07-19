import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Image, Crown, Settings, Video, Type } from 'lucide-react';
import { WeddingCardData, VideoCardData } from '@/types';
import MultiPhotoUpload from './MultiPhotoUpload';
import LogoUpload from './LogoUpload';
import TemplateEditor from './TemplateEditor';
import VideoCardCreator from './VideoCardCreator';
import BasicInfoForm from './BasicInfoForm';

interface CustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const CustomizationForm = ({ cardData, onDataChange }: CustomizationFormProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

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
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="basic" className="flex flex-col items-center space-y-1 h-full">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex flex-col items-center space-y-1 h-full">
            <Image className="h-4 w-4" />
            <span className="text-xs">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex flex-col items-center space-y-1 h-full">
            <Crown className="h-4 w-4" />
            <span className="text-xs">Logo</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex flex-col items-center space-y-1 h-full">
            <Type className="h-4 w-4" />
            <span className="text-xs">Fonts</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex flex-col items-center space-y-1 h-full">
            <Video className="h-4 w-4" />
            <span className="text-xs">Video</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-0">
          <BasicInfoForm
            cardData={cardData}
            onDataChange={onDataChange}
            validationErrors={validationErrors}
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
        </TabsContent>

        <TabsContent value="logo" className="space-y-6">
          <LogoUpload
            logo={cardData.logoImage}
            onLogoChange={handleLogoChange}
          />
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <TemplateEditor
            customization={cardData.customization || {}}
            onCustomizationChange={handleCustomizationChange}
            templateId={cardData.templateId}
          />
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <VideoCardCreator
            cardData={cardData as VideoCardData}
            onDataChange={onDataChange}
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
