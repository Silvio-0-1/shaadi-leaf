import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Image, Crown, Palette, Video, Sparkles } from 'lucide-react';
import { WeddingCardData, VideoCardData } from '@/types';
import MultiPhotoUpload from './MultiPhotoUpload';
import LogoUpload from './LogoUpload';
import TemplateEditor from './TemplateEditor';
import VideoCardCreator from './VideoCardCreator';
import BasicInfoForm from './BasicInfoForm';

interface PremiumCustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const PremiumCustomizationForm = ({ cardData, onDataChange }: PremiumCustomizationFormProps) => {
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
      label: 'Design',
      icon: Palette,
      description: 'Fonts & styling',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200'
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      description: 'Coming soon',
      color: 'bg-green-500/10 text-green-600 border-green-200'
    }
  ];

  const getTabCount = () => {
    let count = 0;
    if (cardData.brideName || cardData.groomName) count++;
    if (cardData.uploadedImages?.length) count++;
    if (cardData.logoImage) count++;
    if (cardData.customization?.fonts) count++;
    return count;
  };

  return (
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
              const isCompleted = 
                (tab.id === 'basic' && (cardData.brideName || cardData.groomName)) ||
                (tab.id === 'photos' && cardData.uploadedImages?.length) ||
                (tab.id === 'design' && cardData.customization?.fonts) ||
                (tab.id === 'video' && false);

              const isVideoTab = tab.id === 'video';

              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  disabled={isVideoTab}
                  className={`flex items-center gap-2 h-10 px-3 text-sm font-medium ${
                    isVideoTab ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isCompleted && !isVideoTab && (
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1" />
                  )}
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
            />
          </TabsContent>

          <TabsContent value="photos" className="space-y-0 mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Image className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Photo Gallery</h3>
                <Badge variant="outline" className="ml-auto text-xs">Max 4</Badge>
              </div>
              
              <MultiPhotoUpload
                images={cardData.uploadedImages || []}
                onImagesChange={handleImagesChange}
                maxImages={4}
                photoShape={cardData.customization?.photoShape || 'rounded'}
                onPhotoShapeChange={handlePhotoShapeChange}
              />
            </div>
          </TabsContent>


          <TabsContent value="design" className="space-y-0 mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium">Fonts</h3>
              </div>
              
              <TemplateEditor
                customization={cardData.customization || {}}
                onCustomizationChange={handleCustomizationChange}
                templateId={cardData.templateId}
              />
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-0 mt-0">
            <div className="space-y-4 relative">
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Video Features</h3>
                <Badge variant="outline" className="ml-auto text-xs">Coming Soon</Badge>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/70 z-10 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2 p-6">
                    <Video className="h-8 w-8 text-muted-foreground mx-auto" />
                    <h4 className="font-medium">Video Features Coming Soon</h4>
                    <p className="text-xs text-muted-foreground">
                      Animated cards and video backgrounds are on the way!
                    </p>
                  </div>
                </div>
                
                <div className="blur-sm pointer-events-none h-32 bg-muted/20 rounded-lg"></div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default PremiumCustomizationForm;