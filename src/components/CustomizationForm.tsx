
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Heart, MessageCircle, Settings, Image, Video, Crown } from 'lucide-react';
import { WeddingCardData, VideoCardData } from '@/types';
import MultiPhotoUpload from './MultiPhotoUpload';
import LogoUpload from './LogoUpload';
import TemplateEditor from './TemplateEditor';
import VideoCardCreator from './VideoCardCreator';
import { toast } from 'sonner';

interface CustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const CustomizationForm = ({ cardData, onDataChange }: CustomizationFormProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (field: keyof WeddingCardData, value: string) => {
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    onDataChange({ [field]: value });
  };

  const handleImagesChange = (images: string[]) => {
    onDataChange({ uploadedImages: images });
    toast.success(`${images.length} photo(s) updated`);
  };

  const handleLogoChange = (logo: string) => {
    onDataChange({ logoImage: logo });
  };

  const handleCustomizationChange = (customization: any) => {
    onDataChange({ customization });
  };

  const getFieldError = (field: string) => validationErrors[field];

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Customize Your Card
        </h2>
        <p className="text-muted-foreground">
          Create your perfect wedding invitation with advanced customization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center space-x-1">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Photos</span>
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center space-x-1">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Logo</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Design</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center space-x-1">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Video</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Names Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brideName" className="flex items-center text-foreground">
                <Heart className="h-4 w-4 mr-2 text-primary" />
                Bride's Name *
              </Label>
              <Input
                id="brideName"
                type="text"
                placeholder="Enter bride's name"
                value={cardData.brideName}
                onChange={(e) => handleChange('brideName', e.target.value)}
                className={`focus:ring-primary ${getFieldError('brideName') ? 'border-destructive' : ''}`}
              />
              {getFieldError('brideName') && (
                <p className="text-sm text-destructive">{getFieldError('brideName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="groomName" className="flex items-center text-foreground">
                <Heart className="h-4 w-4 mr-2 text-primary" />
                Groom's Name *
              </Label>
              <Input
                id="groomName"
                type="text"
                placeholder="Enter groom's name"
                value={cardData.groomName}
                onChange={(e) => handleChange('groomName', e.target.value)}
                className={`focus:ring-primary ${getFieldError('groomName') ? 'border-destructive' : ''}`}
              />
              {getFieldError('groomName') && (
                <p className="text-sm text-destructive">{getFieldError('groomName')}</p>
              )}
            </div>
          </div>

          {/* Wedding Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weddingDate" className="flex items-center text-foreground">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                Wedding Date
              </Label>
              <Input
                id="weddingDate"
                type="date"
                value={cardData.weddingDate}
                onChange={(e) => handleChange('weddingDate', e.target.value)}
                className={`focus:ring-primary ${getFieldError('weddingDate') ? 'border-destructive' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {getFieldError('weddingDate') && (
                <p className="text-sm text-destructive">{getFieldError('weddingDate')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue" className="flex items-center text-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Venue
              </Label>
              <Input
                id="venue"
                type="text"
                placeholder="Enter wedding venue"
                value={cardData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                className="focus:ring-primary"
              />
            </div>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center text-foreground">
              <MessageCircle className="h-4 w-4 mr-2 text-primary" />
              Personal Message
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personal message or invitation text..."
              value={cardData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="focus:ring-primary resize-none min-h-[100px]"
              maxLength={250}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Add a heartfelt message for your guests</span>
              <span>{cardData.message.length}/250</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="space-y-6">
          <MultiPhotoUpload
            images={cardData.uploadedImages || []}
            onImagesChange={handleImagesChange}
            maxImages={6}
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
      <div className="pt-4 border-t">
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
