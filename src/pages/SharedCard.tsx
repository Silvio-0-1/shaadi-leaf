
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Loader2, Sparkles } from 'lucide-react';
import { templates } from '@/data/templates';
import { WeddingCardData, CardElements } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const SharedCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<WeddingCardData | null>(null);
  const [elementPositions, setElementPositions] = useState<CardElements | null>(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  // Confetti animation function
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        shapes: ['heart'],
        colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#ff69b4']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Add sparkle effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 360,
        startVelocity: 30,
        gravity: 0.5,
        ticks: 300,
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB'],
        shapes: ['star'],
        scalar: 0.8
      });
    }, 500);
  };

  useEffect(() => {
    const loadSharedCard = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('shared_wedding_cards')
          .select('*')
          .eq('id', id)
          .eq('is_public', true)
          .single();

        if (error) throw error;

        // Parse JSON fields safely
        let uploadedImages: string[] = [];
        let customization = {};

        try {
          uploadedImages = data.uploaded_images ? JSON.parse(data.uploaded_images as string) : [];
        } catch (e) {
          uploadedImages = Array.isArray(data.uploaded_images) ? data.uploaded_images as string[] : [];
        }

        try {
          customization = data.customization ? JSON.parse(data.customization as string) : {};
        } catch (e) {
          customization = typeof data.customization === 'object' ? data.customization : {};
        }

        let elementPositions = null;
        try {
          elementPositions = data.element_positions ? JSON.parse(data.element_positions as string) : null;
        } catch (e) {
          elementPositions = typeof data.element_positions === 'object' ? data.element_positions : null;
        }

        const mappedCardData: WeddingCardData = {
          id: data.id,
          brideName: data.bride_name,
          groomName: data.groom_name,
          weddingDate: data.wedding_date,
          venue: data.venue,
          message: data.message,
          templateId: data.template_id,
          uploadedImages: uploadedImages,
          logoImage: data.logo_image,
          customization: customization,
        };

        setCardData(mappedCardData);
        setElementPositions(elementPositions);
        
        // Trigger animation and confetti after a short delay
        setTimeout(() => {
          setAnimate(true);
          triggerConfetti();
        }, 800);
        
      } catch (error) {
        console.error('Error loading shared card:', error);
        toast.error('Wedding card not found or no longer available');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadSharedCard();
  }, [id, navigate]);

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

  const getElementStyle = (elementKey: keyof CardElements, defaultStyle: any = {}) => {
    if (!elementPositions || !elementPositions[elementKey]) {
      return defaultStyle;
    }
    
    const element = elementPositions[elementKey];
    
    if (elementKey === 'photo' && 'position' in element) {
      return {
        ...defaultStyle,
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${element.position.x}px, ${element.position.y}px)`,
        zIndex: 10,
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

  const handleCreateCardClick = () => {
    window.open('https://shaadileaf.com/', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading wedding card...</p>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-semibold">Card Not Found</h1>
          <p className="text-muted-foreground">This wedding card is no longer available.</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const template = templates.find(t => t.id === cardData.templateId);

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
    const baseClasses = isMainPhoto ? "w-24 h-24 object-cover border-4 border-white shadow-lg" : "w-16 h-16 object-cover border-2 border-white shadow-md";
    
    switch (photoShape) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'square':
        return `${baseClasses} rounded-none`;
      case 'rounded':
      default:
        return `${baseClasses} ${isMainPhoto ? 'rounded-full' : 'rounded-lg'}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 animate-pulse">
          <Heart className="h-6 w-6 text-pink-300 opacity-60" fill="currentColor" />
        </div>
        <div className="absolute top-20 right-20 animate-pulse delay-1000">
          <Sparkles className="h-5 w-5 text-rose-300 opacity-50" />
        </div>
        <div className="absolute bottom-32 left-16 animate-pulse delay-500">
          <Heart className="h-4 w-4 text-pink-200 opacity-40" fill="currentColor" />
        </div>
        <div className="absolute bottom-40 right-24 animate-pulse delay-700">
          <Sparkles className="h-6 w-6 text-rose-200 opacity-60" />
        </div>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Enhanced Header Section */}
        <div className="text-center">
          <div className={`transition-all duration-1500 ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-200 via-rose-200 to-pink-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <h1 className="relative text-4xl font-serif font-bold text-foreground mb-3 bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                You're Invited!
              </h1>
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-300"></div>
                <Heart className="h-5 w-5 text-pink-500 animate-pulse" fill="currentColor" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-300"></div>
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                <span className="text-pink-600 font-semibold">{cardData.brideName}</span>
                <span className="mx-2 text-pink-400">&</span>
                <span className="text-pink-600 font-semibold">{cardData.groomName}</span>
                <br />
                <span className="text-base text-muted-foreground italic">are getting married</span>
              </p>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-1500 delay-500 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <Card 
            className="aspect-[3/4] overflow-hidden wedding-card-shadow transition-all duration-500 hover:shadow-2xl border-2 border-pink-100"
            style={getBackgroundStyle()}
          >
            <div className="relative h-full p-8 flex flex-col justify-center items-center text-center">
              {!template?.backgroundImage && (
                <div 
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: template?.colors.primary }}
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
                      className={getPhotoClasses(true)}
                    />
                  ) : (
                    <div className="flex flex-wrap justify-center gap-2 max-w-48">
                      {cardData.uploadedImages.slice(0, 4).map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`Wedding ${index + 1}`} 
                          className={getPhotoClasses(false)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={`space-y-3 mb-8 ${elementPositions ? 'contents' : ''}`}>
                <h1 
                  className="text-3xl font-serif font-bold leading-tight"
                  style={{ 
                    color: template?.colors.primary,
                    ...getElementStyle('brideName')
                  }}
                >
                  {cardData.brideName}
                </h1>
                <div 
                  className="flex items-center justify-center"
                  style={getElementStyle('heartIcon')}
                >
                  <div 
                    className="h-px w-8"
                    style={{ backgroundColor: `${template?.colors.primary}50` }}
                  />
                  <Heart 
                    className="h-4 w-4 mx-3" 
                    fill={`${template?.colors.primary}80`}
                    style={{ color: `${template?.colors.primary}80` }}
                  />
                  <div 
                    className="h-px w-8"
                    style={{ backgroundColor: `${template?.colors.primary}50` }}
                  />
                </div>
                <h1 
                  className="text-3xl font-serif font-bold leading-tight"
                  style={{ 
                    color: template?.colors.primary,
                    ...getElementStyle('groomName')
                  }}
                >
                  {cardData.groomName}
                </h1>
              </div>

              <div className={`space-y-4 mb-6 ${elementPositions ? 'contents' : ''}`}>
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

              {!template?.backgroundImage && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-px w-12"
                      style={{ backgroundColor: `${template?.colors.primary}30` }}
                    />
                    <Heart 
                      className="h-3 w-3"
                      fill={`${template?.colors.primary}40`}
                      style={{ color: `${template?.colors.primary}40` }}
                    />
                    <div 
                      className="h-px w-12"
                      style={{ backgroundColor: `${template?.colors.primary}30` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className={`text-center transition-all duration-1500 delay-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button 
            onClick={handleCreateCardClick}
            className="wedding-gradient text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg font-semibold"
          >
            Create Your Own Wedding Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedCard;
