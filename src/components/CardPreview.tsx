
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Download, FileImage } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { templates } from '@/data/templates';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';

interface CardPreviewProps {
  cardData: WeddingCardData;
}

const CardPreview = ({ cardData }: CardPreviewProps) => {
  const template = templates.find(t => t.id === cardData.templateId);
  
  if (!template) {
    return (
      <Card className="aspect-[3/4] p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Select a template to see preview</p>
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

  const handleDownloadImage = () => {
    downloadAsImage('wedding-card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
  };

  const handleDownloadPDF = () => {
    downloadAsPDF('wedding-card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
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
        className="aspect-[3/4] overflow-hidden wedding-card-shadow"
        style={{ 
          background: `linear-gradient(135deg, ${template.colors.secondary} 0%, ${template.colors.primary}15 100%)`,
        }}
      >
        <div className="relative h-full p-8 flex flex-col justify-center items-center text-center">
          {/* Decorative Elements */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <Heart 
              className="h-8 w-8 text-primary/30" 
              fill="currentColor"
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
          <div className="space-y-2 mb-8">
            <h1 
              className="text-3xl font-serif font-bold"
              style={{ 
                color: template.colors.primary,
                fontFamily: template.fonts.heading 
              }}
            >
              {cardData.brideName || 'Bride\'s Name'}
            </h1>
            <div className="flex items-center justify-center">
              <div className="h-px bg-primary/30 w-8"></div>
              <Heart className="h-4 w-4 mx-3 text-primary/50" fill="currentColor" />
              <div className="h-px bg-primary/30 w-8"></div>
            </div>
            <h1 
              className="text-3xl font-serif font-bold"
              style={{ 
                color: template.colors.primary,
                fontFamily: template.fonts.heading 
              }}
            >
              {cardData.groomName || 'Groom\'s Name'}
            </h1>
          </div>

          {/* Date */}
          {cardData.weddingDate && (
            <div className="flex items-center justify-center mb-4 text-foreground/80">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">
                {formatDate(cardData.weddingDate)}
              </span>
            </div>
          )}

          {/* Venue */}
          {cardData.venue && (
            <div className="flex items-center justify-center mb-6 text-foreground/80">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{cardData.venue}</span>
            </div>
          )}

          {/* Message */}
          {cardData.message && (
            <div className="max-w-64 text-sm text-foreground/70 leading-relaxed">
              <p className="italic">"{cardData.message}"</p>
            </div>
          )}

          {/* Decorative Footer */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2">
              <div className="h-px bg-primary/30 w-12"></div>
              <Heart className="h-3 w-3 text-primary/40" fill="currentColor" />
              <div className="h-px bg-primary/30 w-12"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Download Buttons */}
      {hasContent && (
        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleDownloadImage}
            className="w-full wedding-gradient text-white"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download as Image
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <FileImage className="h-4 w-4 mr-2" />
            Download as PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardPreview;
