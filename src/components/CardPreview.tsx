import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download, FileImage, Share2, Play, Settings, Calendar, MapPin, Loader2, Link, Check } from 'lucide-react';
import { WeddingCardData, CardElements } from '@/types';
import { templates } from '@/data/templates';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';
import AuthDialog from './AuthDialog';
import InteractiveCardPreview from './InteractiveCardPreview';
import { toast } from 'sonner';

interface CardPreviewProps {
  cardData: WeddingCardData;
}

const CardPreview = ({ cardData }: CardPreviewProps) => {
  const { user } = useAuth();
  const { deductCredits, hasEnoughCredits } = useCredits();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<'image' | 'pdf' | 'video' | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [savedPositions, setSavedPositions] = useState<CardElements | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    image: false,
    pdf: false,
    video: false,
    share: false
  });
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
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
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    
    try {
      let creditCost = 0;
      let actionType = '';
      let description = '';
      
      switch (type) {
        case 'image':
          creditCost = 10;
          actionType = 'download_image';
          description = 'Downloaded wedding card as image';
          break;
        case 'pdf':
          creditCost = 30;
          actionType = 'download_pdf';
          description = 'Downloaded wedding card as PDF';
          break;
        case 'video':
          creditCost = 50;
          actionType = 'download_video';
          description = 'Generated video wedding card';
          break;
      }

      if (!hasEnoughCredits(creditCost)) {
        toast.error(`Insufficient credits! You need ${creditCost} credits for this download.`);
        return;
      }

      const success = await deductCredits(creditCost, actionType, description);
      if (!success) {
        toast.error('Failed to deduct credits. Please try again.');
        return;
      }

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
          await new Promise(resolve => setTimeout(resolve, 3000));
          toast.success('Video card generated and downloaded!');
          break;
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${type}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleAuthSuccess = () => {
    if (pendingDownload) {
      executeDownload(pendingDownload);
      setPendingDownload(null);
    }
  };

  const generateShareableLink = async () => {
    setLoadingStates(prev => ({ ...prev, share: true }));
    
    try {
      if (!user) {
        setShowAuthDialog(true);
        return;
      }

      // Save card data to database for sharing
      const shareableCardData = {
        bride_name: cardData.brideName,
        groom_name: cardData.groomName,
        wedding_date: cardData.weddingDate,
        venue: cardData.venue,
        message: cardData.message || '',
        template_id: cardData.templateId,
        uploaded_images: JSON.stringify(cardData.uploadedImages || []),
        logo_image: cardData.logoImage || null,
        customization: JSON.stringify(cardData.customization || {}),
        element_positions: JSON.stringify(savedPositions || null),
        user_id: user.id,
        is_public: true
      };

      const { data, error } = await supabase
        .from('shared_wedding_cards')
        .insert(shareableCardData)
        .select()
        .single();

      if (error) throw error;
      
      const shareUrl = `${window.location.origin}/shared/${data.id}`;
      setShareUrl(shareUrl);
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Shareable link copied to clipboard!');
      } else {
        toast.success('Shareable link generated!');
      }
      
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to generate shareable link');
    } finally {
      setLoadingStates(prev => ({ ...prev, share: false }));
    }
  };

  const copyShareLink = async () => {
    if (shareUrl && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleInteractive = () => {
    setIsInteractive(!isInteractive);
  };

  const handlePositionsUpdate = (positions: CardElements) => {
    setSavedPositions(positions);
  };

  const getElementStyle = (elementKey: keyof CardElements, defaultStyle: any = {}) => {
    if (!savedPositions || !savedPositions[elementKey]) {
      return defaultStyle;
    }
    
    const element = savedPositions[elementKey];
    
    if (elementKey === 'photo' && 'position' in element) {
      return {
        ...defaultStyle,
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${element.position.x}px, ${element.position.y}px)`,
        zIndex: 10,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
      };
    }
    
    if ('x' in element && 'y' in element) {
      return {
        ...defaultStyle,
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${element.x}px, ${element.y}px)`,
        zIndex: 10,
      };
    }
    
    return defaultStyle;
  };

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

  const getPhotoClasses = (isMainPhoto: boolean = false) => {
    const photoShape = cardData.customization?.photoShape || 'rounded';
    const baseClasses = isMainPhoto ? "border-4 border-white shadow-lg" : "border-2 border-white shadow-md";
    
    switch (photoShape) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'square':
        return `${baseClasses} rounded-none`;
      case 'rounded':
      default:
        return `${baseClasses} ${isMainPhoto ? 'rounded-lg' : 'rounded-lg'}`;
    }
  };

  const hasContent = cardData.brideName || cardData.groomName || cardData.weddingDate || cardData.venue || cardData.message;

  // Get font styles
  const getFontFamily = (element: 'heading' | 'date' | 'venue' | 'message') => {
    const fonts = cardData.customization?.fonts;
    if (!fonts) return template?.fonts?.heading || 'Playfair Display';
    
    switch (element) {
      case 'heading':
        return fonts.heading || template?.fonts?.heading || 'Playfair Display';
      case 'date':
        return fonts.date || fonts.body || template?.fonts?.body || 'Inter';
      case 'venue':
        return fonts.venue || fonts.body || template?.fonts?.body || 'Inter';
      case 'message':
        return fonts.message || fonts.body || template?.fonts?.body || 'Inter';
      default:
        return template?.fonts?.heading || 'Playfair Display';
    }
  };

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
                <div style={savedPositions?.photos ? { position: 'relative' } : getElementStyle('photo', { marginBottom: '24px' })}>
                  {cardData.uploadedImages.length === 1 ? (
                    <div 
                      className={getPhotoClasses(true)}
                      style={savedPositions?.photo ? {
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${savedPositions.photo.position.x}px, ${savedPositions.photo.position.y}px)`,
                        width: `${savedPositions.photo.size.width}px`,
                        height: `${savedPositions.photo.size.height}px`,
                        backgroundImage: `url(${cardData.uploadedImages[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 10
                      } : {
                        width: '96px',
                        height: '96px',
                        backgroundImage: `url(${cardData.uploadedImages[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  ) : (
                    <div className="flex flex-wrap justify-center gap-2 max-w-48">
                      {cardData.uploadedImages.slice(0, 4).map((image, index) => {
                        const photoPosition = savedPositions?.photos?.find(p => p.id === `photo-${index}`);
                        return (
                          <div 
                            key={index}
                            className={getPhotoClasses(false)}
                            style={photoPosition ? {
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: `translate(-50%, -50%) translate(${photoPosition.position.x}px, ${photoPosition.position.y}px)`,
                              width: `${photoPosition.size.width}px`,
                              height: `${photoPosition.size.height}px`,
                              backgroundImage: `url(${image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              zIndex: 10
                            } : {
                              width: '64px',
                              height: '64px',
                              backgroundImage: `url(${image})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className={`space-y-3 mb-8 ${savedPositions ? 'contents' : ''}`}>
                <h1 
                  className="text-3xl font-serif font-bold leading-tight"
                  style={{ 
                    color: template.colors.primary,
                    fontFamily: getFontFamily('heading'),
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
                    fontFamily: getFontFamily('heading'),
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
                    <span 
                      className="font-medium text-sm"
                      style={{ fontFamily: getFontFamily('date') }}
                    >
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
                    <span 
                      className="text-sm"
                      style={{ fontFamily: getFontFamily('venue') }}
                    >
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
                  <span 
                    className="italic"
                    style={{ fontFamily: getFontFamily('message') }}
                  >
                    "{cardData.message}"
                  </span>
                </div>
              )}

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
              disabled={loadingStates.image}
            >
              {loadingStates.image ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download as Image (10 Credits)
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleDownloadAttempt('pdf')}
                variant="outline"
                className="flex-1"
                disabled={loadingStates.pdf}
              >
                {loadingStates.pdf ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileImage className="h-4 w-4 mr-1" />
                )}
                {loadingStates.pdf ? 'Generating...' : 'PDF (30 Credits)'}
              </Button>
              <Button 
                onClick={() => handleDownloadAttempt('video')}
                variant="outline"
                className="flex-1"
                disabled={loadingStates.video}
              >
                {loadingStates.video ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                {loadingStates.video ? 'Creating...' : 'Video (50 Credits)'}
              </Button>
            </div>
            
            <Button 
              onClick={generateShareableLink}
              variant="outline"
              className="w-full"
              disabled={loadingStates.share}
            >
              {loadingStates.share ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              {loadingStates.share ? 'Generating Link...' : 'Share Card'}
            </Button>

            {shareUrl && (
              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">Shareable Link:</p>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={shareUrl} 
                    readOnly 
                    className="flex-1 text-xs bg-background border rounded px-2 py-1 text-muted-foreground"
                  />
                  <Button
                    onClick={copyShareLink}
                    size="sm"
                    variant="outline"
                    className="px-2"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Link className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view your wedding card
                </p>
              </div>
            )}
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
