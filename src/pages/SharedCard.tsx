
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
      if (!id) {
        console.log('DEBUG: No ID provided');
        return;
      }

      console.log('DEBUG: Starting to load shared card with ID:', id);
      console.log('DEBUG: ID length:', id.length);

      try {
        let data, error;
        
        // If ID is 8 characters or less, use like pattern to find matching UUID
        if (id.length <= 8) {
          console.log('DEBUG: Using short ID pattern search for:', id);
          const { data: result, error: queryError } = await supabase
            .from('shared_wedding_cards')
            .select('*')
            .filter('id', 'like', `${id}%`)
            .eq('is_public', true)
            .limit(1)
            .single();
            
          console.log('DEBUG: Short ID query result:', result);
          console.log('DEBUG: Short ID query error:', queryError);
          data = result;
          error = queryError;
        } else {
          console.log('DEBUG: Using exact ID match for:', id);
          // Use exact match for full UUIDs
          const { data: result, error: queryError } = await supabase
            .from('shared_wedding_cards')
            .select('*')
            .eq('id', id)
            .eq('is_public', true)
            .single();
            
          console.log('DEBUG: Exact ID query result:', result);
          console.log('DEBUG: Exact ID query error:', queryError);
          data = result;
          error = queryError;
        }

        console.log('DEBUG: Final data:', data);
        console.log('DEBUG: Final error:', error);

        if (error) {
          console.error('DEBUG: Database error occurred:', error);
          throw error;
        }
        if (!data) {
          console.error('DEBUG: No data returned from query');
          throw new Error('Card not found');
        }

        // Handle data fields (they're already in correct format from database)
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
        
        // Trigger animation and confetti after a short delay
        setTimeout(() => {
          setAnimate(true);
          triggerConfetti();
        }, 800);
        
      } catch (error) {
        console.error('Error loading shared card:', error);
        toast.error('Wedding card not found or no longer available');
        // Don't redirect automatically, let user choose
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
    navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Magical background with floating hearts and stars */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating hearts */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <Heart 
              className={`h-${3 + Math.floor(Math.random() * 3)} w-${3 + Math.floor(Math.random() * 3)} text-pink-300 opacity-${20 + Math.floor(Math.random() * 40)}`} 
              fill="currentColor" 
            />
          </div>
        ))}
        
        {/* Sparkling stars */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Sparkles 
              className={`h-${2 + Math.floor(Math.random() * 3)} w-${2 + Math.floor(Math.random() * 3)} text-yellow-300 opacity-${30 + Math.floor(Math.random() * 40)}`}
            />
          </div>
        ))}
        
        {/* Glowing orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-10 blur-xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Premium Header Section */}
        <div className="text-center">
          <div className={`transition-all duration-2000 ${animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <div className="relative mb-8">
              <div className="absolute -inset-8 bg-gradient-to-r from-pink-500/20 via-purple-500/30 to-pink-500/20 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/10 via-pink-400/20 to-yellow-400/10 rounded-full blur-xl opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              <h1 className="relative text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-yellow-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                You're Invited!
              </h1>
              
              <div className="flex items-center justify-center space-x-4 mb-3">
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-yellow-300 to-pink-300 rounded-full"></div>
                <Heart className="h-6 w-6 text-pink-400 animate-pulse drop-shadow-lg" fill="currentColor" />
                <div className="h-0.5 w-16 bg-gradient-to-l from-transparent via-yellow-300 to-pink-300 rounded-full"></div>
              </div>
              
              <div className="backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 p-4 mx-4">
                <p className="text-xl font-medium text-white drop-shadow-md">
                  <span className="text-yellow-300 font-bold drop-shadow-lg">{cardData.brideName}</span>
                  <span className="mx-3 text-pink-300 text-2xl">&</span>
                  <span className="text-yellow-300 font-bold drop-shadow-lg">{cardData.groomName}</span>
                  <br />
                  <span className="text-lg text-pink-100 italic drop-shadow-sm">are getting married</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-2000 delay-500 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/30 via-purple-500/40 to-pink-500/30 rounded-2xl blur-xl opacity-80 animate-pulse"></div>
            <Card 
              className="relative aspect-[3/4] overflow-hidden backdrop-blur-sm bg-white/95 border-2 border-white/50 shadow-2xl transition-all duration-500 hover:shadow-pink-500/25 hover:scale-105"
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
        </div>

        <div className={`text-center transition-all duration-2000 delay-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/50 via-pink-500/50 to-yellow-400/50 rounded-full blur-lg opacity-60 animate-pulse"></div>
            <Button 
              onClick={handleCreateCardClick}
              className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-10 py-4 text-xl rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-pink-500/50 border-2 border-white/20"
            >
              <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
              Create Your Own Wedding Card
              <Heart className="ml-2 h-5 w-5 animate-pulse" fill="currentColor" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedCard;
