
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, MapPin, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { useState } from 'react';
import CreditActionButton from './CreditActionButton';
import { useCredits } from '@/hooks/useCredits';

interface BasicInfoFormProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
  validationErrors?: Record<string, string>;
}

const messagePrompts = [
  "professional and elegant",
  "warm and friendly", 
  "romantic and heartfelt",
  "modern and casual",
  "formal and traditional"
];

const BasicInfoForm = ({ cardData, onDataChange, validationErrors = {} }: BasicInfoFormProps) => {
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const { CREDIT_COSTS } = useCredits();

  const handleChange = (field: keyof WeddingCardData, value: string) => {
    onDataChange({ [field]: value });
  };

  const generateAIMessage = async () => {
    if (!cardData.brideName || !cardData.groomName) {
      return;
    }

    setGeneratingMessage(true);
    
    try {
      const currentPrompt = messagePrompts[currentPromptIndex];
      
      // Simulate AI generation - in a real app, you'd call an AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const messages = {
        "professional and elegant": `We cordially invite you to celebrate the union of ${cardData.brideName} and ${cardData.groomName} as they begin their journey together as one. Your presence would honor us on this special day.`,
        "warm and friendly": `Hey there! ${cardData.brideName} and ${cardData.groomName} are getting married and would love for you to be part of their special day! Come celebrate with us - it's going to be amazing!`,
        "romantic and heartfelt": `Two hearts, one love story. ${cardData.brideName} and ${cardData.groomName} have found their forever in each other, and they would be honored to share this magical moment with you.`,
        "modern and casual": `Save the date! ${cardData.brideName} & ${cardData.groomName} are tying the knot and want you there to party with them. Let's make some memories!`,
        "formal and traditional": `The honor of your presence is requested at the marriage ceremony of ${cardData.brideName} and ${cardData.groomName}. Together with their families, they invite you to witness their vows of love.`
      };
      
      const generatedMessage = messages[currentPrompt as keyof typeof messages];
      handleChange('message', generatedMessage);
      
      // Cycle to next prompt for variety
      setCurrentPromptIndex((prev) => (prev + 1) % messagePrompts.length);
      
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
          
          <div className="flex items-center justify-between">
            <CreditActionButton
              creditCost={CREDIT_COSTS.AI_GENERATE_MESSAGE}
              actionType="ai_generate_message"
              actionName="Generate with AI"
              onAction={generateAIMessage}
              disabled={generatingMessage || !cardData.brideName || !cardData.groomName}
              variant="outline"
              size="sm"
              className="text-xs"
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
                  <Badge variant="secondary" className="ml-2">
                    {CREDIT_COSTS.AI_GENERATE_MESSAGE}
                  </Badge>
                </>
              )}
            </CreditActionButton>
            
            <span className="text-xs text-muted-foreground">
              {cardData.message.length}/250
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
