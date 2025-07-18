
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download, FileImage, Share2, Play, Settings, Calendar, MapPin } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { templates } from '@/data/templates';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';
import { useAuth } from '@/contexts/AuthContext';
import AuthDialog from './AuthDialog';
import InteractiveCardPreview from './InteractiveCardPreview';
import { toast } from 'sonner';

interface CardPreviewProps {
  cardData: WeddingCardData;
}

interface ElementPosition {
  x: number;
  y: number;
}

interface CardElements {
  brideName: ElementPosition;
  groomName: ElementPosition;
  heartIcon: ElementPosition;
  weddingDate: ElementPosition;
  venue: ElementPosition;
  message: ElementPosition;
  photo: ElementPosition;
  logo: ElementPosition;
}

const CardPreview = ({ cardData }: CardPreviewProps) => {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<'image' | 'pdf' | 'video' | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [savedPositions, setSavedPositions] = useState<CardElements | null>(null);
  
  const template = templates.find(t => t.id === cardData.templateId);

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
    
    executeDownload(type);
  };

  const executeDownload = async (type: 'image' | 'pdf' | 'video') => {
    try {
      switch (type) {
        case 'image':
          await downloadAsImage('card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
          toast.success('Card downloaded as image!');
          break;
        case 'pdf':
          await downloadAsPDF('card-preview', `${cardData.brideName}-${cardData.groomName}-wedding-card`);
          toast.success('Card downloaded as PDF!');
          break;
        case 'video':
          toast.info('Generating video card...');
          setTimeout(() => {
            toast.success('Video card generated and downloaded!');
          }, 3000);
          break;
      }
    } catch (error) {
      console.error('Download error:', error);
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
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleInteractive = () => {
    setIsInteractive(!isInteractive);
  };

  const handlePositionsUpdate = (positions: CardElements) => {
    setSavedPositions(positions);
  };

  // Helper function to get element style with saved positions
  const getElementStyle = (elementKey: keyof CardElements, defaultStyle: any = {}) => {
    if (!savedPositions || !savedPositions[elementKey]) {
      return defaultStyle;
    }
    
    const position = savedPositions[elementKey];
    return {
      ...defaultStyle,
      position: 'absolute' as const,
      left: '50%',
      top: '50%',
      transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
      zIndex: 10,
    };
  };

  // Get background style for custom templates
  const getBackgroundStyle = () => {
    if (template?.backgroundImage) {
      return {
        backgroundImage: `url(${template.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {
      background: `linear-gradient(135deg, ${template?.colors.secondary} 0%, ${template?.colors.primary}15 100%)`
    };
  };

  const hasContent = cardData.brideName || cardData.groomName || cardData.weddingDate || cardData.venue || cardData.message;

  if (!template) {
    return (
      <div className="sticky top-24 space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
            Live Preview
          </h2>
          <p className="text-muted-foreground">
            See how your card looks in real-time
          </p>
        </div>
        
        <Card className="aspect-[3/4] p-8 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60">
          <div className="text-center space-y-3">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground font-medium">Select a template to see preview</p>
            <p className="text-sm text-muted-foreground">Choose from our beautiful collection</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-24 space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
            Live Preview
          </h2>
          <p className="text-muted-foreground">
            See how your card looks in real-time
          </p>
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleToggleInteractive}
              variant={isInteractive ? "default" : "outline"}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isInteractive ? 'Exit Edit Mode' : 'Customize Layout'}
            </Button>
          </div>
        </div>
        
        {isInteractive ? (
          <InteractiveCardPreview 
            cardData={cardData} 
            initialPositions={savedPositions}
            onPositionsUpdate={handlePositionsUpdate}
          />
        ) : (
          <Card 
            id="card-preview"
            className="aspect-[3/4] overflow-hidden wedding-card-shadow transition-all duration-300 hover:shadow-xl"
            style={getBackgroundStyle()}
          >
            <div className="relative h-full p-8 flex flex-col justify-center items-center text-center">
              {/* Decorative top border - only show if no custom background */}
              {!template.backgroundImage && (
                <div 
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: template.colors.primary }}
                />
              )}
              
              {cardData.logoImage && (
                <div style={getElementStyle('logo', { position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)' })}>
                  <img 
                    src={cardData.logoImage} 
                    alt="Wedding Logo" 
                    className="w-16 h-16 object-contain opacity-80"
                  />
                </div>
              )}

              {(cardData.uploadedImages && cardData.uploadedImages.length > 0) && (
                <div style={getElementStyle('photo', { marginBottom: '24px' })}>
                  {cardData.uploadedImages.length === 1 ? (
                    <img 
                      src={cardData.uploadedImages[0]} 
                      alt="Wedding" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="flex flex-wrap justify-center gap-2 max-w-48">
                      {cardData.uploadedImages.slice(0, 4).map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`Wedding ${index + 1}`} 
                          className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                        />
                      ))}
                      {cardData.uploadedImages.length > 4 && (
                        <div className="w-16 h-16 rounded-lg border-2 border-white shadow-md bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{cardData.uploadedImages.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={`space-y-3 mb-8 ${savedPositions ? 'contents' : ''}`}>
                <h1 
                  className="text-3xl font-serif font-bold leading-tight"
                  style={{ 
                    color: template.colors.primary,
                    ...getElementStyle('brideName')
                  }}
                >
                  {cardData.brideName || 'Bride\'s Name'}
                </h1>
                <div 
                  className="flex items-center justify-center"
                  style={getElementStyle('heartIcon')}
                >
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
                    ...getElementStyle('groomName')
                  }}
                >
                  {cardData.groomName || 'Groom\'s Name'}
                </h1>
              </div>

              <div className={`space-y-4 mb-6 ${savedPositions ? 'contents' : ''}`}>
                {cardData.weddingDate && (
                  <div 
                    className="flex items-center justify-center text-gray-700"
                    style={getElementStyle('weddingDate')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">
                      {formatDate(cardData.weddingDate)}
                    </span>
                  </div>
                )}

                {cardData.venue && (
                  <div 
                    className="flex items-center justify-center text-gray-700"
                    style={getElementStyle('venue')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {cardData.venue}
                    </span>
                  </div>
                )}
              </div>

              {cardData.message && (
                <div 
                  className="max-w-64 text-sm leading-relaxed text-gray-700"
                  style={getElementStyle('message')}
                >
                  <span className="italic">
                    "{cardData.message}"
                  </span>
                </div>
              )}

              {/* Decorative Footer - only show if no custom background */}
              {!template.backgroundImage && (
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
              )}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {hasContent && (
          <div className="space-y-3">
            <Button 
              onClick={() => handleDownloadAttempt('image')}
              className="w-full wedding-gradient text-white hover:shadow-lg transition-all"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Image (10 Credits)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleDownloadAttempt('pdf')}
                variant="outline"
                className="flex-1"
              >
                <FileImage className="h-4 w-4 mr-1" />
                PDF (30 Credits)
              </Button>
              <Button 
                onClick={() => handleDownloadAttempt('video')}
                variant="outline"
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Video (50 Credits)
              </Button>
            </div>
            
            <Button 
              onClick={handleShare}
              variant="outline"
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        )}

        {/* Template Info */}
        {template && (
          <div className="p-3 bg-muted/30 rounded-lg">
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
            {template.category === 'custom' && (
              <div className="flex items-center mt-1">
                <span className="text-xs text-purple-600 font-medium">🎨 Custom Template</span>
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
