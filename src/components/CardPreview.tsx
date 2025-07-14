
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Download, FileImage, Share2 } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { templates } from '@/data/templates';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';
import { toast } from 'sonner';

interface CardPreviewProps {
  cardData: WeddingCardData;
}

const CardPreview = ({ cardData }: CardPreviewProps) => {
  const template = templates.find(t => t.id === cardData.templateId);
  
  if (!template) {
    return (
      <Card className="aspect-[3/4] p-8 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60">
        <div className="text-center space-y-3">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground font-medium">Select a template to see preview</p>
          <p className="text-sm text-muted-foreground">Choose from our beautiful collection</p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleDownloadImage = async () => {
    try {
      await downloadAsImage('wedding-card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
      toast.success('Card downloaded as image!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadAsPDF('wedding-card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
      toast.success('Card downloaded as PDF!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cardData.brideName} & ${cardData.groomName} Wedding`,
          text: `You're invited to our wedding!`,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const hasContent = cardData.brideName || cardData.groomName || cardData.weddingDate || cardData.venue || cardData.message;

  return (
    <div className="sticky top-24">
      <div className="text-center mb-4">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Live Preview
        </h2>
        <p className="text-muted-foreground">
          See how your card looks in real-time
        </p>
      </div>
      
      <Card 
        id="wedding-card-preview"
        className="aspect-[3/4] overflow-hidden wedding-card-shadow transition-all duration-300 hover:shadow-xl"
        style={{ 
          background: `linear-gradient(135deg, ${template.colors.secondary} 0%, ${template.colors.primary}15 100%)`,
        }}
      >
        <div className="relative h-full p-8 flex flex-col justify-center items-center text-center">
          {/* Decorative top border */}
          <div 
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: template.colors.primary }}
          />
          
          {/* Decorative corner elements */}
          <div className="absolute top-6 left-6">
            <div 
              className="w-8 h-8 rounded-full opacity-20"
              style={{ backgroundColor: template.colors.accent }}
            />
          </div>
          <div className="absolute top-6 right-6">
            <div 
              className="w-8 h-8 rounded-full opacity-20"
              style={{ backgroundColor: template.colors.accent }}
            />
          </div>

          {/* Uploaded Image */}
          {cardData.uploadedImage && (
            <div className="mb-6">
              <img 
                src={cardData.uploadedImage} 
                alt="Wedding" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          )}

          {/* Names */}
          <div className="space-y-3 mb-8">
            <h1 
              className="text-3xl font-serif font-bold leading-tight"
              style={{ 
                color: template.colors.primary,
                fontFamily: template.fonts.heading 
              }}
            >
              {cardData.brideName || 'Bride\'s Name'}
            </h1>
            <div className="flex items-center justify-center">
              <div 
                className="h-px w-8"
                style={{ backgroundColor: `${template.colors.primary}50` }}
              />
              <Heart 
                className="h-4 w-4 mx-3" 
                fill={`${template.colors.primary}80`}
                style={{ color: `${template.colors.primary}80` }}
              />
              <div 
                className="h-px w-8"
                style={{ backgroundColor: `${template.colors.primary}50` }}
              />
            </div>
            <h1 
              className="text-3xl font-serif font-bold leading-tight"
              style={{ 
                color: template.colors.primary,
                fontFamily: template.fonts.heading 
              }}
            >
              {cardData.groomName || 'Groom\'s Name'}
            </h1>
          </div>

          {/* Wedding Details */}
          <div className="space-y-4 mb-6">
            {cardData.weddingDate && (
              <div className="flex items-center justify-center text-foreground/80">
                <Calendar className="h-4 w-4 mr-2" />
                <span 
                  className="font-medium text-sm"
                  style={{ fontFamily: template.fonts.body }}
                >
                  {formatDate(cardData.weddingDate)}
                </span>
              </div>
            )}

            {cardData.venue && (
              <div className="flex items-center justify-center text-foreground/80">
                <MapPin className="h-4 w-4 mr-2" />
                <span 
                  className="text-sm"
                  style={{ fontFamily: template.fonts.body }}
                >
                  {cardData.venue}
                </span>
              </div>
            )}
          </div>

          {/* Message */}
          {cardData.message && (
            <div className="max-w-64 text-sm text-foreground/70 leading-relaxed">
              <p 
                className="italic"
                style={{ fontFamily: template.fonts.body }}
              >
                "{cardData.message}"
              </p>
            </div>
          )}

          {/* Decorative Footer */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2">
              <div 
                className="h-px w-12"
                style={{ backgroundColor: `${template.colors.primary}30` }}
              />
              <Heart 
                className="h-3 w-3"
                fill={`${template.colors.primary}40`}
                style={{ color: `${template.colors.primary}40` }}
              />
              <div 
                className="h-px w-12"
                style={{ backgroundColor: `${template.colors.primary}30` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      {hasContent && (
        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleDownloadImage}
            className="w-full wedding-gradient text-white hover:shadow-lg transition-all"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download as Image
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex-1"
            >
              <FileImage className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              onClick={handleShare}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}

      {/* Template Info */}
      {template && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Template:</span>
            <span className="font-medium">{template.name}</span>
          </div>
          {template.isPremium && (
            <div className="flex items-center mt-1">
              <Heart className="h-3 w-3 text-gold-500 mr-1" fill="currentColor" />
              <span className="text-xs text-gold-600 font-medium">Premium Template</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardPreview;
