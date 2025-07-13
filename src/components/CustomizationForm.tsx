
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Heart, MessageCircle } from 'lucide-react';
import { WeddingCardData } from '@/types';
import ImageUpload from './ImageUpload';

interface CustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const CustomizationForm = ({ cardData, onDataChange }: CustomizationFormProps) => {
  const handleChange = (field: keyof WeddingCardData, value: string) => {
    onDataChange({ [field]: value });
  };

  const handleImageUpload = (imageUrl: string) => {
    onDataChange({ uploadedImage: imageUrl });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Customize Your Card
        </h2>
        <p className="text-muted-foreground">
          Fill in your wedding details to personalize your card
        </p>
      </div>

      <div className="space-y-4">
        {/* Image Upload */}
        <ImageUpload 
          onImageUpload={handleImageUpload}
          currentImage={cardData.uploadedImage}
        />

        {/* Bride's Name */}
        <div className="space-y-2">
          <Label htmlFor="brideName" className="flex items-center text-foreground">
            <Heart className="h-4 w-4 mr-2 text-primary" />
            Bride's Name
          </Label>
          <Input
            id="brideName"
            type="text"
            placeholder="Enter bride's name"
            value={cardData.brideName}
            onChange={(e) => handleChange('brideName', e.target.value)}
            className="focus:ring-primary"
          />
        </div>

        {/* Groom's Name */}
        <div className="space-y-2">
          <Label htmlFor="groomName" className="flex items-center text-foreground">
            <Heart className="h-4 w-4 mr-2 text-primary" />
            Groom's Name
          </Label>
          <Input
            id="groomName"
            type="text"
            placeholder="Enter groom's name"
            value={cardData.groomName}
            onChange={(e) => handleChange('groomName', e.target.value)}
            className="focus:ring-primary"
          />
        </div>

        {/* Wedding Date */}
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
            className="focus:ring-primary"
          />
        </div>

        {/* Venue */}
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
            className="focus:ring-primary resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Changes are automatically saved and reflected in the preview
        </p>
      </div>
    </Card>
  );
};

export default CustomizationForm;
