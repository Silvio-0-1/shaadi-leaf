
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Heart, Calendar, MapPin, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { useState } from 'react';
import CreditActionButton from './CreditActionButton';
import { useCredits } from '@/hooks/useCredits';
import { validateName, validateVenue, validateMessage, validateWeddingDate, sanitizeInput } from '@/lib/security';

interface BasicInfoFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
  validationErrors?: Record<string, string>;
}

const BasicInfoForm = ({ cardData, onDataChange, validationErrors = {} }: BasicInfoFormProps) => {
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [includeNames, setIncludeNames] = useState(true);
  const { CREDIT_COSTS } = useCredits();

  const handleChange = (field: keyof WeddingCardData, value: string) => {
    // Sanitize input to prevent XSS attacks
    const sanitizedValue = sanitizeInput(value);
    onDataChange({ [field]: sanitizedValue });
  };

  const generateAIMessage = async () => {
    setGeneratingMessage(true);
    
    try {
      // Simulate AI generation - in a real app, you'd call an AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const hasNames = cardData.brideName && cardData.groomName;
      
      // Create varied messages with and without names
      const namedMessages = [
        `We cordially invite you to celebrate the union of ${cardData.brideName} and ${cardData.groomName} as they begin their journey together as one. Your presence would honor us on this special day.`,
        `Hey there! ${cardData.brideName} and ${cardData.groomName} are getting married and would love for you to be part of their special day! Come celebrate with us - it's going to be amazing!`,
        `Two hearts, one love story. ${cardData.brideName} and ${cardData.groomName} have found their forever in each other, and they would be honored to share this magical moment with you.`,
        `Save the date! ${cardData.brideName} & ${cardData.groomName} are tying the knot and want you there to party with them. Let's make some memories!`,
        `The honor of your presence is requested at the marriage ceremony of ${cardData.brideName} and ${cardData.groomName}. Together with their families, they invite you to witness their vows of love.`,
        `Join us as ${cardData.brideName} and ${cardData.groomName} exchange vows and begin their happily ever after. Your love and support mean the world to us!`,
        `Love is in the air! ${cardData.brideName} and ${cardData.groomName} are saying 'I do' and they want you by their side for this incredible celebration.`,
        `It's official - ${cardData.brideName} and ${cardData.groomName} are getting hitched! Come witness their love story unfold in the most beautiful way.`
      ];
      
      const genericMessages = [
        `We cordially invite you to celebrate our wedding day as we begin our journey together as one. Your presence would honor us on this special day.`,
        `Hey there! We're getting married and would love for you to be part of our special day! Come celebrate with us - it's going to be amazing!`,
        `Two hearts, one love story. We've found our forever in each other, and we would be honored to share this magical moment with you.`,
        `Save the date! We're tying the knot and want you there to party with us. Let's make some memories!`,
        `The honor of your presence is requested at our marriage ceremony. Together with our families, we invite you to witness our vows of love.`,
        `Join us as we exchange vows and begin our happily ever after. Your love and support mean the world to us!`,
        `Love is in the air! We're saying 'I do' and we want you by our side for this incredible celebration.`,
        `It's official - we're getting hitched! Come witness our love story unfold in the most beautiful way.`,
        `You're invited to share in our joy as we celebrate the beginning of our forever. Let's make this day unforgettable together!`,
        `We can't wait to say 'I do' and we want you there to celebrate with us. Join us for love, laughter, and happily ever after!`,
        `Our hearts are full and our love is true. Please join us as we start this beautiful new chapter together.`,
        `Together is a wonderful place to be. We invite you to witness our commitment and celebrate our love story.`
      ];
      
      // Use messages based on toggle switch and name availability
      let availableMessages = [];
      if (hasNames && includeNames) {
        // Mix named and generic messages randomly
        availableMessages = [...namedMessages, ...genericMessages];
      } else {
        // Use only generic messages
        availableMessages = genericMessages;
      }
      
      // Randomly select a message
      const randomIndex = Math.floor(Math.random() * availableMessages.length);
      const generatedMessage = availableMessages[randomIndex];
      
      handleChange('message', generatedMessage);
      
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setGeneratingMessage(false);
    }
  };

  const getFieldError = (field: string) => validationErrors[field];

  return (
    <div className="space-y-6">
      {/* Names Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Couple Details</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brideName" className="text-sm font-medium text-foreground">
              Bride's Name *
            </Label>
            <Input
              id="brideName"
              type="text"
              placeholder="Enter bride's name"
              value={cardData.brideName}
              onChange={(e) => handleChange('brideName', e.target.value)}
              className={`${getFieldError('brideName') ? 'border-destructive' : ''}`}
            />
            {getFieldError('brideName') && (
              <p className="text-sm text-destructive">{getFieldError('brideName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="groomName" className="text-sm font-medium text-foreground">
              Groom's Name *
            </Label>
            <Input
              id="groomName"
              type="text"
              placeholder="Enter groom's name"
              value={cardData.groomName}
              onChange={(e) => handleChange('groomName', e.target.value)}
              className={`${getFieldError('groomName') ? 'border-destructive' : ''}`}
            />
            {getFieldError('groomName') && (
              <p className="text-sm text-destructive">{getFieldError('groomName')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Wedding Details Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Event Details</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weddingDate" className="text-sm font-medium text-foreground">
              Wedding Date
            </Label>
            <Input
              id="weddingDate"
              type="date"
              value={cardData.weddingDate}
              onChange={(e) => handleChange('weddingDate', e.target.value)}
              className={`${getFieldError('weddingDate') ? 'border-destructive' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
            {getFieldError('weddingDate') && (
              <p className="text-sm text-destructive">{getFieldError('weddingDate')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-sm font-medium text-foreground">
              Venue
            </Label>
            <Input
              id="venue"
              type="text"
              placeholder="Enter wedding venue"
              value={cardData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Personal Message */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-foreground">Personal Message</h3>
        </div>
        
        <div className="space-y-3">
          <Textarea
            id="message"
            placeholder="Add a personal message or invitation text..."
            value={cardData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className="resize-none min-h-[120px]"
            maxLength={250}
          />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-names"
                checked={includeNames}
                onCheckedChange={setIncludeNames}
              />
              <Label htmlFor="include-names" className="text-xs text-muted-foreground">
                Include bride and groom names
              </Label>
            </div>
          </div>
          
          <div className="flex justify-center">
            <CreditActionButton
              creditCost={CREDIT_COSTS.AI_GENERATE_MESSAGE}
              actionType="ai_generate_message"
              actionName="Generate with AI"
              onAction={generateAIMessage}
              disabled={generatingMessage}
              variant="outline"
              size="sm"
              className="text-xs bg-gradient-to-r from-[#ff6b6b] via-[#feca57] via-[#48dbfb] via-[#ff9ff3] via-[#54a0ff] via-[#5f27cd] to-[#00d2d3] text-white border-0 hover:opacity-90 transition-opacity"
            >
              {generatingMessage ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate with AI
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                    {CREDIT_COSTS.AI_GENERATE_MESSAGE} credits
                  </Badge>
                </>
              )}
            </CreditActionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
