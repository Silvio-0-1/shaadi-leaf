import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Loader2, Sparkles, Star } from 'lucide-react';
import { templates } from '@/data/templates';
import { WeddingCardData, CardElements } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useIsMobile } from '@/hooks/use-mobile';

const SharedCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [cardData, setCardData] = useState<WeddingCardData | null>(null);
  const [elementPositions, setElementPositions] = useState<CardElements | null>(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  // Premium confetti animation with heart petals
  const triggerPremiumConfetti = () => {
    const count = 300;
    const defaults = {
      origin: { y: 0.7 },
      spread: 120,
      ticks: 400,
      gravity: 0.6,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Heart petals
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      shapes: ['heart'],
      colors: ['#FFB7C5', '#FFD700', '#E6E6FA', '#FF69B4', '#DDA0DD']
    });

    // Golden sparkles
    fire(0.2, {
      spread: 60,
      shapes: ['star'],
      colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520']
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      shapes: ['circle'],
      colors: ['#E6E6FA', '#DDA0DD', '#B19CD9']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      shapes: ['square'],
      colors: ['#FFD700', '#FFA500']
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      shapes: ['heart'],
      colors: ['#FF69B4', '#FFB7C5']
    });

    // Delayed magical sparkle burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 360,
        startVelocity: 30,
        gravity: 0.4,
        ticks: 300,
        colors: ['#FFD700', '#FFA500', '#E6E6FA', '#DDA0DD', '#FF69B4'],
        shapes: ['star'],
        scalar: 1.2
      });
    }, 500);
  };

  useEffect(() => {
    const loadSharedCard = async () => {
      if (!id) {
        console.log('DEBUG: No ID provided');
        return;
      }

      console.log('DEBUG: Starting to load shared card with ID:', id);

      try {
        let data, error;
        const client = supabase;
        
        // Handle both short ID patterns and full UUIDs
        if (id.length <= 8) {
          console.log('DEBUG: Using short ID pattern search for:', id);
          const { data: results, error: queryError } = await client
            .from('shared_wedding_cards')
            .select('*')
            .eq('is_public', true);
            
          if (queryError) {
            error = queryError;
            data = null;
          } else {
            const result = results?.find(card => String(card.id).startsWith(id));
            data = result || null;
            error = result ? null : { message: 'No matching card found' };
          }
        } else {
          console.log('DEBUG: Using exact ID match for:', id);
          const { data: result, error: queryError } = await client
            .from('shared_wedding_cards')
            .select('*')
            .eq('id', id)
            .eq('is_public', true)
            .maybeSingle();
            
          data = result;
          error = queryError;
        }

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        if (!data) {
          throw new Error('Wedding card not found or no longer available');
        }

        const uploadedImages = Array.isArray(data.uploaded_images) ? data.uploaded_images : [];
        const customization = typeof data.customization === 'object' && data.customization !== null ? data.customization : {};
        const elementPositions = typeof data.element_positions === 'object' && data.element_positions !== null ? data.element_positions : null;

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
        
        // Delayed premium entrance with confetti
        setTimeout(() => {
          setAnimate(true);
        }, 300);
        
        setTimeout(() => {
          triggerPremiumConfetti();
        }, 1000);
        
      } catch (error) {
        console.error('Error loading shared card:', error);
        setCardData(null);
        setElementPositions(null);
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

  const getPhotoClasses = (isMainPhoto: boolean = false) => {
    const photoShape = cardData?.customization?.photoShape || 'rounded';
    const baseClasses = isMainPhoto 
      ? `${isMobile ? 'w-24 h-24' : 'w-28 h-28'} object-cover border-4 border-gold-200 shadow-xl` 
      : `${isMobile ? 'w-16 h-16' : 'w-20 h-20'} object-cover border-2 border-gold-200 shadow-lg`;
    
    switch (photoShape) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'square':
        return `${baseClasses} rounded-none`;
      case 'rounded':
      default:
        return `${baseClasses} ${isMainPhoto ? 'rounded-full' : 'rounded-xl'}`;
    }
  };

  const handleCreateCardClick = () => {
    navigate('/');
  };

  const handleCardClick = () => {
    triggerPremiumConfetti();
  };

  if (loading) {
    return (
      <div className="min-h-screen premium-gradient-bg flex items-center justify-center relative overflow-hidden">
        {/* Premium loading animation background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={`loading-sparkle-${i}`}
              className="absolute animate-floating-sparkles"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            >
              <Sparkles 
                className="h-4 w-4 text-gold-400 opacity-40" 
              />
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-6 z-10">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-glow rounded-full"></div>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-gold-600 relative z-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-premium-serif text-white animate-text-fade-in">
              Unveiling Your Special Moment
            </h2>
            <p className="text-lavender-50 font-premium-sans animate-text-fade-in" style={{ animationDelay: '0.2s' }}>
              Preparing something magical...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen premium-gradient-bg flex items-center justify-center">
        <div className="text-center space-y-6 glassmorphism p-12 rounded-3xl max-w-md mx-4">
          <Heart className="h-16 w-16 text-gold-500 mx-auto animate-pulse" />
          <h1 className="text-3xl font-premium-serif text-white">Card Not Found</h1>
          <p className="text-lavender-100 font-premium-sans">This wedding card is no longer available or has been made private.</p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-gold-500 hover:bg-gold-600 text-white font-premium-sans shimmer-effect golden-border"
          >
            Discover More Cards
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
      background: `linear-gradient(135deg, ${template?.colors.secondary}15 0%, ${template?.colors.primary}25 100%)`
    };
  };

  return (
    <div className="min-h-screen premium-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium magical background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating sparkles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-floating-sparkles"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Sparkles 
              className={`h-${2 + Math.floor(Math.random() * 3)} w-${2 + Math.floor(Math.random() * 3)} text-gold-400 opacity-${30 + Math.floor(Math.random() * 50)}`}
            />
          </div>
        ))}
        
        {/* Floating hearts */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            <Heart 
              className={`h-${3 + Math.floor(Math.random() * 2)} w-${3 + Math.floor(Math.random() * 2)} text-lavender-100 opacity-${25 + Math.floor(Math.random() * 30)}`} 
              fill="currentColor" 
            />
          </div>
        ))}
        
        {/* Golden stars */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Star 
              className="h-3 w-3 text-gold-300 opacity-40" 
              fill="currentColor"
            />
          </div>
        ))}
      </div>

      <div className={`w-full ${isMobile ? 'max-w-sm px-2' : 'max-w-lg'} space-y-${isMobile ? '6' : '8'} z-10`}>
        {/* Premium header section with elegant typography */}
        <div className={`text-center transition-all duration-1500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="relative mb-8">
            <div className="absolute -inset-12 bg-gradient-to-r from-lavender-100/20 via-gold-400/30 to-lavender-100/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute -inset-6 bg-gradient-to-r from-gold-200/10 via-lavender-200/20 to-gold-200/10 rounded-full blur-2xl opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            <h1 className={`relative ${isMobile ? 'text-4xl' : 'text-6xl'} font-premium-serif font-bold mb-6 premium-text-gradient drop-shadow-2xl`}>
              You're Invited
            </h1>
            
            <div className={`flex items-center justify-center ${isMobile ? 'space-x-4' : 'space-x-6'} mb-4`}>
              <div className={`h-0.5 ${isMobile ? 'w-12' : 'w-20'} bg-gradient-to-r from-transparent via-gold-400 to-lavender-200 rounded-full`}></div>
              <Heart className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-gold-400 animate-pulse drop-shadow-lg`} fill="currentColor" />
              <div className={`h-0.5 ${isMobile ? 'w-12' : 'w-20'} bg-gradient-to-l from-transparent via-gold-400 to-lavender-200 rounded-full`}></div>
            </div>
            
            <div className={`glassmorphism golden-border rounded-3xl ${isMobile ? 'p-4 mx-2' : 'p-6 mx-4'} shimmer-effect`}>
              <div className="space-y-2">
                <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-premium-serif text-gold-700 drop-shadow-sm`}>
                  <span className="font-bold">{cardData.brideName}</span>
                  <span className={`${isMobile ? 'mx-2 text-2xl' : 'mx-4 text-3xl'} text-lavender-200`}>&</span>
                  <span className="font-bold">{cardData.groomName}</span>
                </p>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-premium-sans text-lavender-600 italic`}>
                  are getting married
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium wedding card */}
        <div className={`transition-all duration-2000 delay-700 ${animate ? 'animate-premium-entrance' : 'opacity-0'}`}>
          <div className="relative group">
            <div className="absolute -inset-6 bg-gradient-to-r from-gold-400/30 via-lavender-200/40 to-gold-400/30 rounded-3xl blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <Card 
              className="relative aspect-[3/4] glassmorphism golden-border shadow-2xl transition-all duration-700 hover:scale-105 cursor-pointer shimmer-effect group rounded-3xl overflow-hidden"
              style={getBackgroundStyle()}
              onClick={handleCardClick}
            >
              <div className="silk-texture absolute inset-0 opacity-30"></div>
              
              <div className={`relative h-full ${isMobile ? 'p-6' : 'p-8'} flex flex-col justify-center items-center text-center space-y-${isMobile ? '3' : '4'}`}>
                {!template?.backgroundImage && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-3 rounded-t-3xl"
                    style={{ backgroundColor: template?.colors.primary }}
                  />
                )}
                
                {cardData.logoImage && (
                  <div style={getElementStyle('logo', { position: 'absolute', top: '32px', left: '50%', transform: 'translateX(-50%)' })}>
                    <img 
                      src={cardData.logoImage} 
                      alt="Wedding Logo" 
                      className="w-20 h-20 object-contain opacity-90 drop-shadow-lg"
                    />
                  </div>
                )}

                {(cardData.uploadedImages && cardData.uploadedImages.length > 0) && (
                  <div style={getElementStyle('photo', { marginBottom: '32px' })} className="animate-text-fade-in">
                    {cardData.uploadedImages.length === 1 ? (
                      <img 
                        src={cardData.uploadedImages[0]} 
                        alt="Wedding couple" 
                        className={getPhotoClasses(true)}
                      />
                    ) : (
                      <div className="flex flex-wrap justify-center gap-3 max-w-56">
                        {cardData.uploadedImages.slice(0, 4).map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`Wedding photo ${index + 1}`}
                            className={getPhotoClasses(false)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{...getElementStyle('brideName'), animationDelay: '0.3s'}} className="space-y-2 animate-text-fade-in">
                  <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-premium-serif font-bold text-gold-800 drop-shadow-sm`}>
                    {cardData.brideName} & {cardData.groomName}
                  </h2>
                </div>

                {cardData.weddingDate && (
                  <div style={{...getElementStyle('weddingDate'), animationDelay: '0.6s'}} className="flex items-center space-x-2 animate-text-fade-in">
                    <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-lavender-600`} />
                    <span className={`${isMobile ? 'text-base' : 'text-lg'} font-premium-sans text-lavender-700 font-medium`}>
                      {formatDate(cardData.weddingDate)}
                    </span>
                  </div>
                )}

                {cardData.venue && (
                  <div style={{...getElementStyle('venue'), animationDelay: '0.9s'}} className="flex items-center space-x-2 animate-text-fade-in">
                    <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-lavender-600`} />
                    <span className={`${isMobile ? 'text-sm' : 'text-base'} font-premium-sans text-lavender-700`}>
                      {cardData.venue}
                    </span>
                  </div>
                )}

                {cardData.message && (
                  <div style={{...getElementStyle('message'), animationDelay: '1.2s'}} className="animate-text-fade-in">
                    <p className={`${isMobile ? 'text-sm max-w-64' : 'text-base max-w-xs'} font-premium-sans text-lavender-600 italic leading-relaxed`}>
                      "{cardData.message}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Premium call-to-action */}
        <div className={`text-center transition-all duration-1500 delay-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className={`glassmorphism rounded-2xl ${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
            <p className={`${isMobile ? 'text-base' : 'text-lg'} font-premium-sans text-lavender-100`}>
              Create your own magical wedding invitation
            </p>
            <Button
              onClick={handleCreateCardClick}
              size={isMobile ? "default" : "lg"}
              className={`bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-premium-sans font-semibold ${isMobile ? 'px-6 py-3' : 'px-8 py-4'} rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 shimmer-effect`}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create Your Wedding Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedCard;