import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Undo2, Redo2, RotateCcw } from 'lucide-react';
import { WeddingCardData, CardElements, ElementPosition, PhotoElement, IndividualPhotoElement } from '@/types';
import { templates } from '@/data/templates';
import DraggableElement from './DraggableElement';

interface InteractiveCardPreviewProps {
  cardData: WeddingCardData;
  initialPositions?: CardElements | null;
  onPositionsUpdate?: (positions: CardElements) => void;
}

const defaultPositions: CardElements = {
  brideName: { x: 0, y: -40 },
  groomName: { x: 0, y: 40 },
  heartIcon: { x: 0, y: 0 },
  weddingDate: { x: 0, y: 120 },
  venue: { x: 0, y: 150 },
  message: { x: 0, y: 200 },
  photo: { 
    position: { x: 0, y: -120 },
    size: { width: 120, height: 120 }
  },
  photos: [],
  logo: { x: 0, y: -180 },
};

const InteractiveCardPreview = ({ cardData, initialPositions, onPositionsUpdate }: InteractiveCardPreviewProps) => {
  const template = templates.find(t => t.id === cardData.templateId);
  
  // Use template's default positions if available, otherwise use general defaults
  const getDefaultPositions = useCallback((): CardElements => {
    if (template?.defaultPositions) {
      return {
        ...template.defaultPositions,
        photo: template.defaultPositions.photo || defaultPositions.photo,
        photos: []
      };
    }
    return defaultPositions;
  }, [template?.defaultPositions]);

  const [positions, setPositions] = useState<CardElements>(() => {
    if (initialPositions) {
      return initialPositions;
    }
    
    const initial = getDefaultPositions();
    
    // Initialize individual photos if we have multiple images
    if (cardData.uploadedImages && cardData.uploadedImages.length > 1) {
      const photosArray: IndividualPhotoElement[] = cardData.uploadedImages.map((_, index) => ({
        id: `photo-${index}`,
        position: { 
          x: (index % 2 === 0 ? -60 : 60) + (index * 20), 
          y: -120 + (Math.floor(index / 2) * 140) 
        },
        size: { width: 100, height: 100 }
      }));
      
      return {
        ...initial,
        photos: photosArray
      };
    }
    
    return initial;
  });

  const [history, setHistory] = useState<CardElements[]>([positions]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Update positions when component receives new initialPositions - but only if they're different
  useEffect(() => {
    if (initialPositions && JSON.stringify(initialPositions) !== JSON.stringify(positions)) {
      setPositions(initialPositions);
      setHistory([initialPositions]);
      setHistoryIndex(0);
    }
  }, [initialPositions]);

  // Notify parent component when positions change
  useEffect(() => {
    if (onPositionsUpdate) {
      onPositionsUpdate(positions);
    }
  }, [positions, onPositionsUpdate]);
  
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

  const handleElementMove = useCallback((elementId: keyof CardElements | string, newPosition: ElementPosition) => {
    if (elementId.startsWith('photo-')) {
      // Handle individual photo movement
      const photoId = elementId;
      setPositions(prevPositions => {
        const newPositions = { 
          ...prevPositions, 
          photos: prevPositions.photos?.map(photo => 
            photo.id === photoId 
              ? { ...photo, position: newPosition }
              : photo
          ) || []
        };
        
        // Add to history
        setHistory(prevHistory => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(newPositions);
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
        
        return newPositions;
      });
    } else {
      // Handle other elements
      setPositions(prevPositions => {
        const newPositions = { 
          ...prevPositions, 
          [elementId]: elementId === 'photo' 
            ? { ...prevPositions.photo, position: newPosition }
            : newPosition 
        };
        
        // Add to history
        setHistory(prevHistory => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(newPositions);
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
        
        return newPositions;
      });
    }
  }, [historyIndex]);

  const handlePhotoResize = useCallback((photoId: string, newSize: { width: number; height: number }) => {
    if (photoId.startsWith('photo-')) {
      // Handle individual photo resize - maintain aspect ratio
      setPositions(prevPositions => {
        const newPositions = {
          ...prevPositions,
          photos: prevPositions.photos?.map(photo =>
            photo.id === photoId
              ? { ...photo, size: newSize }
              : photo
          ) || []
        };
        
        // Add to history
        setHistory(prevHistory => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(newPositions);
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
        
        return newPositions;
      });
    } else {
      // Handle single photo resize - maintain aspect ratio
      setPositions(prevPositions => {
        const newPositions = {
          ...prevPositions,
          photo: {
            ...prevPositions.photo,
            size: newSize
          }
        };
        
        // Add to history
        setHistory(prevHistory => {
          const newHistory = prevHistory.slice(0, historyIndex + 1);
          newHistory.push(newPositions);
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
        
        return newPositions;
      });
    }
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPositions(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPositions(history[historyIndex + 1]);
    }
  };

  const reset = () => {
    const defaultPos = getDefaultPositions();
    setPositions(defaultPos);
    setHistory([defaultPos]);
    setHistoryIndex(0);
  };

  const backgroundPattern = cardData.customization?.backgroundPattern || 'none';
  const layout = cardData.customization?.layout || 'classic';

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
    
    if (backgroundPattern === 'none') {
      return {
        background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary}15 100%)`
      };
    }
    
    return {};
  };

  // Get photo classes based on shape
  const getPhotoClasses = () => {
    const photoShape = cardData.customization?.photoShape || 'rounded';
    const baseClasses = "w-full h-full object-cover border-4 border-white shadow-lg";
    
    switch (photoShape) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'square':
        return `${baseClasses} rounded-none`;
      case 'rounded':
      default:
        return `${baseClasses} rounded-lg`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Buttons */}
      <div className="flex justify-center space-x-2">
        <Button
          onClick={undo}
          disabled={historyIndex <= 0}
          variant="outline"
          size="sm"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          variant="outline"
          size="sm"
        >
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <Card 
        ref={cardRef}
        id="card-preview"
        className={`aspect-[3/4] overflow-hidden wedding-card-shadow transition-all duration-300 hover:shadow-xl relative ${!template?.backgroundImage ? getBackgroundClass() : ''}`}
        style={getBackgroundStyle()}
      >
        <div className="relative h-full flex items-center justify-center">
          {/* Decorative top border - only show if no custom background */}
          {!template?.backgroundImage && (
            <div 
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: colors.primary }}
            />
          )}

          {/* Logo/Monogram */}
          {cardData.logoImage && (
            <DraggableElement
              id="logo"
              position={positions.logo}
              onMove={(pos) => handleElementMove('logo', pos)}
              containerRef={cardRef}
            >
              <img 
                src={cardData.logoImage} 
                alt="Wedding Logo" 
                className="w-16 h-16 object-contain opacity-80"
              />
            </DraggableElement>
          )}

          {/* Photos */}
          {(cardData.uploadedImages && cardData.uploadedImages.length > 0) && (
            <>
              {cardData.uploadedImages.length === 1 ? (
                <DraggableElement
                  id="photo"
                  position={positions.photo.position}
                  onMove={(pos) => handleElementMove('photo', pos)}
                  containerRef={cardRef}
                  resizable={true}
                  size={positions.photo.size}
                  onResize={(size) => handlePhotoResize('photo', size)}
                  minSize={{ width: 60, height: 60 }}
                  maxSize={{ width: 200, height: 200 }}
                  maintainAspectRatio={true}
                >
                  <img 
                    src={cardData.uploadedImages[0]} 
                    alt="Wedding" 
                    className={getPhotoClasses()}
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </DraggableElement>
              ) : (
                // Multiple photos - render individually
                positions.photos?.map((photo, index) => (
                  cardData.uploadedImages && cardData.uploadedImages[index] && (
                    <DraggableElement
                      key={photo.id}
                      id={photo.id}
                      position={photo.position}
                      onMove={(pos) => handleElementMove(photo.id, pos)}
                      containerRef={cardRef}
                      resizable={true}
                      size={photo.size}
                      onResize={(size) => handlePhotoResize(photo.id, size)}
                      minSize={{ width: 50, height: 50 }}
                      maxSize={{ width: 150, height: 150 }}
                      maintainAspectRatio={true}
                    >
                      <img 
                        src={cardData.uploadedImages[index]} 
                        alt={`Wedding photo ${index + 1}`}
                        className={`w-full h-full object-cover border-4 border-white shadow-lg ${
                          cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                          cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                          'rounded-lg'
                        }`}
                        style={{ 
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </DraggableElement>
                  )
                ))
              )}
            </>
          )}

          {/* Bride's Name */}
          <DraggableElement
            id="brideName"
            position={positions.brideName}
            onMove={(pos) => handleElementMove('brideName', pos)}
            containerRef={cardRef}
          >
            <h1 
              className="text-3xl font-serif font-bold leading-tight text-center"
              style={{ 
                color: colors.primary,
                fontFamily: getFontFamily('heading')
              }}
            >
              {cardData.brideName || 'Bride\'s Name'}
            </h1>
          </DraggableElement>

          {/* Heart Icon */}
          <DraggableElement
            id="heartIcon"
            position={positions.heartIcon}
            onMove={(pos) => handleElementMove('heartIcon', pos)}
            containerRef={cardRef}
          >
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
          </DraggableElement>

          {/* Groom's Name */}
          <DraggableElement
            id="groomName"
            position={positions.groomName}
            onMove={(pos) => handleElementMove('groomName', pos)}
            containerRef={cardRef}
          >
            <h1 
              className="text-3xl font-serif font-bold leading-tight text-center"
              style={{ 
                color: colors.primary,
                fontFamily: getFontFamily('heading')
              }}
            >
              {cardData.groomName || 'Groom\'s Name'}
            </h1>
          </DraggableElement>

          {/* Wedding Date */}
          {cardData.weddingDate && (
            <DraggableElement
              id="weddingDate"
              position={positions.weddingDate}
              onMove={(pos) => handleElementMove('weddingDate', pos)}
              containerRef={cardRef}
            >
              <div className="flex items-center justify-center" style={{ color: colors.text }}>
                <Calendar className="h-4 w-4 mr-2" />
                <span 
                  className="font-medium text-sm"
                  style={{ fontFamily: getFontFamily('date') }}
                >
                  {formatDate(cardData.weddingDate)}
                </span>
              </div>
            </DraggableElement>
          )}

          {/* Venue */}
          {cardData.venue && (
            <DraggableElement
              id="venue"
              position={positions.venue}
              onMove={(pos) => handleElementMove('venue', pos)}
              containerRef={cardRef}
            >
              <div className="flex items-center justify-center" style={{ color: colors.text }}>
                <MapPin className="h-4 w-4 mr-2" />
                <span 
                  className="text-sm"
                  style={{ fontFamily: getFontFamily('venue') }}
                >
                  {cardData.venue}
                </span>
              </div>
            </DraggableElement>
          )}

          {/* Message */}
          {cardData.message && (
            <DraggableElement
              id="message"
              position={positions.message}
              onMove={(pos) => handleElementMove('message', pos)}
              containerRef={cardRef}
            >
              <div className="max-w-64 text-sm leading-relaxed text-center" style={{ color: colors.text }}>
                <span 
                  className="italic"
                  style={{ fontFamily: getFontFamily('message') }}
                >
                  "{cardData.message}"
                </span>
              </div>
            </DraggableElement>
          )}

          {/* Decorative Footer - only show if no custom background */}
          {!template?.backgroundImage && (
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
          )}
        </div>
      </Card>
    </div>
  );
};

export default InteractiveCardPreview;
