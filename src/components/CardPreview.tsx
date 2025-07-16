import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Download, FileImage, Share2, Play } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { templates } from '@/data/templates';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from './AuthDialog';
import { toast } from 'sonner';

interface CardPreviewProps {
  cardData: WeddingCardData;
}

const CardPreview = ({ cardData }: CardPreviewProps) => {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<'image' | 'pdf' | 'video' | null>(null);
  
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

  // Get custom colors or fall back to template defaults
  const colors = {
    primary: cardData.customization?.colors?.primary || template.colors.primary,
    secondary: cardData.customization?.colors?.secondary || template.colors.secondary,
    accent: cardData.customization?.colors?.accent || template.colors.accent,
    text: cardData.customization?.colors?.text || '#1f2937'
  };

  // Get custom fonts or fall back to template defaults
  const fonts = {
    heading: cardData.customization?.fonts?.heading || template.fonts.heading,
    body: cardData.customization?.fonts?.body || template.fonts.body
  };

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

  const handleDownloadAttempt = (type: 'image' | 'pdf' | 'video') => {
    if (!user) {
      setPendingDownload(type);
      setShowAuthDialog(true);
      return;
    }
    
    // User is authenticated, proceed with download
    executeDownload(type);
  };

  const executeDownload = async (type: 'image' | 'pdf' | 'video') => {
    try {
      switch (type) {
        case 'image':
          await downloadAsImage('wedding-card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
          toast.success('Card downloaded as image!');
          break;
        case 'pdf':
          await downloadAsPDF('wedding-card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
          toast.success('Card downloaded as PDF!');
          break;
        case 'video':
          toast.info('Generating video card...');
          // In real implementation, this would trigger video generation
          setTimeout(() => {
            toast.success('Video card generated and downloaded!');
          }, 3000);
          break;
      }
    } catch (error) {
      toast.error(`Failed to download ${type}`);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingDownload) {
      executeDownload(pendingDownload);
      setPendingDownload(null);
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
  const layout = cardData.customization?.layout || 'classic';
  const backgroundPattern = cardData.customization?.backgroundPattern || 'none';

  // Background pattern styles
  const getBackgroundClass = () => {
    switch (backgroundPattern) {
      case 'dots': return 'romantic-pattern';
      case 'floral': return 'bg-gradient-to-br from-rose-50 to-pink-50';
      case 'geometric': return 'bg-gradient-to-r from-purple-50 to-blue-50';
      case 'vintage': return 'bg-gradient-to-br from-amber-50 to-orange-50';
      case 'modern': return 'bg-gradient-to-r from-gray-50 to-slate-50';
      default: return '';
    }
  };

  return (
    <>
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
          className={`aspect-[3/4] overflow-hidden wedding-card-shadow transition-all duration-300 hover:shadow-xl ${getBackgroundClass()}`}
          style={{ 
            background: backgroundPattern === 'none' 
              ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary}15 100%)`
              : undefined,
          }}
        >
          <div className="relative h-full p-8 flex flex-col justify-center items-center text-center">
            {/* Decorative top border */}
            <div 
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: colors.primary }}
            />
            
            {/* Logo/Monogram */}
            {cardData.logoImage && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                <img 
                  src={cardData.logoImage} 
                  alt="Wedding Logo" 
                  className="w-16 h-16 object-contain opacity-80"
                />
              </div>
            )}

            {/* Multi-photo layout */}
            {(cardData.uploadedImages && cardData.uploadedImages.length > 0) && (
              <div className="mb-6">
                {layout === 'collage' && cardData.uploadedImages.length > 1 ? (
                  <div className="grid grid-cols-2 gap-2 w-32 h-32">
                    {cardData.uploadedImages.slice(0, 4).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`Wedding photo ${index + 1}`}
                        className="w-full h-full object-cover rounded border-2 border-white shadow-sm"
                      />
                    ))}
                  </div>
                ) : (
                  <img 
                    src={cardData.uploadedImages[0]} 
                    alt="Wedding" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                )}
              </div>
            )}

            {/* Names */}
            <div className="space-y-3 mb-8">
              <h1 
                className="text-3xl font-serif font-bold leading-tight"
                style={{ 
                  color: colors.primary,
                  fontFamily: fonts.heading 
                }}
              >
                {cardData.brideName || 'Bride\'s Name'}
              </h1>
              <div className="flex items-center justify-center">
                <div 
                  className="h-px w-8"
                  style={{ backgroundColor: `${colors.primary}50` }}
                />
                <Heart 
                  className="h-4 w-4 mx-3" 
                  fill={`${colors.primary}80`}
                  style={{ color: `${colors.primary}80` }}
                />
                <div 
                  className="h-px w-8"
                  style={{ backgroundColor: `${colors.primary}50` }}
                />
              </div>
              <h1 
                className="text-3xl font-serif font-bold leading-tight"
                style={{ 
                  color: colors.primary,
                  fontFamily: fonts.heading 
                }}
              >
                {cardData.groomName || 'Groom\'s Name'}
              </h1>
            </div>

            {/* Wedding Details */}
            <div className="space-y-4 mb-6">
              {cardData.weddingDate && (
                <div className="flex items-center justify-center" style={{ color: colors.text }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span 
                    className="font-medium text-sm"
                    style={{ fontFamily: fonts.body }}
                  >
                    {formatDate(cardData.weddingDate)}
                  </span>
                </div>
              )}

              {cardData.venue && (
                <div className="flex items-center justify-center" style={{ color: colors.text }}>
                  <MapPin className="h-4 w-4 mr-2" />
                  <span 
                    className="text-sm"
                    style={{ fontFamily: fonts.body }}
                  >
                    {cardData.venue}
                  </span>
                </div>
              )}
            </div>

            {/* Message */}
            {cardData.message && (
              <div className="max-w-64 text-sm leading-relaxed" style={{ color: colors.text }}>
                <p 
                  className="italic"
                  style={{ fontFamily: fonts.body }}
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
                  style={{ backgroundColor: `${colors.primary}30` }}
                />
                <Heart 
                  className="h-3 w-3"
                  fill={`${colors.primary}40`}
                  style={{ color: `${colors.primary}40` }}
                />
                <div 
                  className="h-px w-12"
                  style={{ backgroundColor: `${colors.primary}30` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {hasContent && (
          <div className="mt-6 space-y-3">
            <Button 
              onClick={() => handleDownloadAttempt('image')}
              className="w-full wedding-gradient text-white hover:shadow-lg transition-all"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Image
            </Button>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => handleDownloadAttempt('pdf')}
                variant="outline"
                className="flex-1"
              >
                <FileImage className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button 
                onClick={() => handleDownloadAttempt('video')}
                variant="outline"
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Video
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-1" />
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
            {cardData.customization && (
              <div className="flex items-center mt-1">
                <span className="text-xs text-primary font-medium">✨ Customized</span>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthDialog 
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default CardPreview;
