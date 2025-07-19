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
      id: 'logo',
      label: 'Logo',
      icon: Crown,
      description: 'Monogram & branding',
      color: 'bg-amber-500/10 text-amber-600 border-amber-200'
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
      description: 'Animated features',
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
    <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Customize Your Card
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              Create your perfect wedding invitation with our premium editor
            </p>
          </div>
          
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              {getTabCount()}/5 Sections
            </Badge>
            <p className="text-xs text-muted-foreground">
              Completed
            </p>
          </div>
        </div>
        
        <Separator />
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/30">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isCompleted = 
                (tab.id === 'basic' && (cardData.brideName || cardData.groomName)) ||
                (tab.id === 'photos' && cardData.uploadedImages?.length) ||
                (tab.id === 'logo' && cardData.logoImage) ||
                (tab.id === 'design' && cardData.customization?.fonts) ||
                (tab.id === 'video' && false); // Video not implemented yet

              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex flex-col items-center space-y-2 h-16 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm relative"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    {isCompleted && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium leading-none">{tab.label}</div>
                    <div className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden sm:block">
                      {tab.description}
                    </div>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <TabsContent value="basic" className="space-y-0 mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-rose-500" />
                <h3 className="text-lg font-semibold">Essential Details</h3>
                <Badge variant="outline" className="ml-auto">Required</Badge>
              </div>
              
              <BasicInfoForm
                cardData={cardData}
                onDataChange={onDataChange}
                validationErrors={validationErrors}
              />
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-0 mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Photo Gallery</h3>
                <Badge variant="outline" className="ml-auto">Up to 4 photos</Badge>
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

          <TabsContent value="logo" className="space-y-0 mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Logo & Monogram</h3>
                <Badge variant="outline" className="ml-auto">Optional</Badge>
              </div>
              
              <LogoUpload
                logo={cardData.logoImage}
                onLogoChange={handleLogoChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-0 mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Typography & Style</h3>
                <Badge variant="outline" className="ml-auto">Customize</Badge>
              </div>
              
              <TemplateEditor
                customization={cardData.customization || {}}
                onCustomizationChange={handleCustomizationChange}
                templateId={cardData.templateId}
              />
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-0 mt-0">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Video Features</h3>
                <Badge variant="outline" className="ml-auto">Premium</Badge>
              </div>
              
              <VideoCardCreator
                cardData={cardData as VideoCardData}
                onDataChange={onDataChange}
              />
            </div>
          </TabsContent>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <Separator className="mb-4" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>Changes are saved automatically</p>
            <div className="flex items-center gap-4">
              <span>✨ Premium Editor</span>
              <span>🎨 Live Preview</span>
              <span>📱 Mobile Optimized</span>
            </div>
          </div>
        </div>
      </Tabs>
    </Card>
  );
};

export default PremiumCustomizationForm;