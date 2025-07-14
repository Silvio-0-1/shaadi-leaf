
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Heart, MessageCircle, Upload, X } from 'lucide-react';
import { WeddingCardData } from '@/types';
import ImageUpload from './ImageUpload';
import { toast } from 'sonner';

interface CustomizationFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
}

const CustomizationForm = ({ cardData, onDataChange }: CustomizationFormProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

  const handleImageUpload = (imageUrl: string) => {
    onDataChange({ uploadedImage: imageUrl });
    toast.success('Image uploaded successfully!');
  };

  const clearImage = () => {
    onDataChange({ uploadedImage: '' });
    toast.success('Image removed');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!cardData.brideName.trim()) {
      errors.brideName = 'Bride\'s name is required';
    }
    
    if (!cardData.groomName.trim()) {
      errors.groomName = 'Groom\'s name is required';
    }
    
    if (cardData.weddingDate && new Date(cardData.weddingDate) < new Date()) {
      errors.weddingDate = 'Wedding date cannot be in the past';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getFieldError = (field: string) => validationErrors[field];

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

      <div className="space-y-6">
        {/* Image Upload Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            Wedding Photo (Optional)
          </Label>
          {cardData.uploadedImage ? (
            <div className="relative">
              <img 
                src={cardData.uploadedImage} 
                alt="Wedding" 
                className="w-full h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <ImageUpload 
              onImageUpload={handleImageUpload}
              currentImage={cardData.uploadedImage}
            />
          )}
        </div>

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
      </div>

      {/* Form Actions */}
      <div className="pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={validateForm}
          className="w-full mb-3"
        >
          Validate Details
        </Button>
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
