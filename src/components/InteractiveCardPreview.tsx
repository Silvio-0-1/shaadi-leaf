
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Undo2, Redo2, RotateCcw } from 'lucide-react';
import { WeddingCardData } from '@/types';
import { templates } from '@/data/templates';
import DraggableElement from './DraggableElement';

interface InteractiveCardPreviewProps {
  cardData: WeddingCardData;
  initialPositions?: CardElements | null;
  onPositionsUpdate?: (positions: CardElements) => void;
}

interface ElementPosition {
  x: number;
  y: number;
}

interface PhotoElement {
  position: ElementPosition;
  size: { width: number; height: number };
}

interface CardElements {
  brideName: ElementPosition;
  groomName: ElementPosition;
  heartIcon: ElementPosition;
  weddingDate: ElementPosition;
  venue: ElementPosition;
  message: ElementPosition;
  photo: PhotoElement;
  logo: ElementPosition;
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
  logo: { x: 0, y: -180 },
};

const InteractiveCardPreview = ({ cardData, initialPositions, onPositionsUpdate }: InteractiveCardPreviewProps) => {
  const template = templates.find(t => t.id === cardData.templateId);
  
  // Use template's default positions if available, otherwise use general defaults
  const getDefaultPositions = (): CardElements => {
    if (template?.defaultPositions) {
      return {
        ...template.defaultPositions,
        photo: template.defaultPositions.photo || defaultPositions.photo
      };
    }
    return defaultPositions;
  };

  const [positions, setPositions] = useState<CardElements>(initialPositions || getDefaultPositions());
  const [history, setHistory] = useState<CardElements[]>([initialPositions || getDefaultPositions()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Update positions when component receives new initialPositions
  useEffect(() => {
    if (initialPositions) {
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

  const handleElementMove = useCallback((elementId: keyof CardElements, newPosition: ElementPosition) => {
    const newPositions = { 
      ...positions, 
      [elementId]: elementId === 'photo' 
        ? { ...positions.photo, position: newPosition }
        : newPosition 
    };
    setPositions(newPositions);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPositions);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [positions, history, historyIndex]);

  const handlePhotoResize = useCallback((newSize: { width: number; height: number }) => {
    const newPositions = {
      ...positions,
      photo: {
        ...positions.photo,
        size: newSize
      }
    };
    setPositions(newPositions);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPositions);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [positions, history, historyIndex]);

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

          {/* Photo */}
          {(cardData.uploadedImages && cardData.uploadedImages.length > 0) && (
            <DraggableElement
              id="photo"
              position={positions.photo.position}
              onMove={(pos) => handleElementMove('photo', pos)}
              containerRef={cardRef}
              resizable={true}
              size={positions.photo.size}
              onResize={handlePhotoResize}
              minSize={{ width: 60, height: 60 }}
              maxSize={{ width: 200, height: 200 }}
            >
              {cardData.uploadedImages.length === 1 ? (
                <img 
                  src={cardData.uploadedImages[0]} 
                  alt="Wedding" 
                  className={getPhotoClasses()}
                />
              ) : (
                <div className="w-full h-full grid grid-cols-2 gap-1">
                  {cardData.uploadedImages.slice(0, 4).map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Wedding photo ${index + 1}`}
                      className={`w-full h-full object-cover border-2 border-white shadow-sm ${
                        cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                        cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                        'rounded'
                      }`}
                    />
                  ))}
                </div>
              )}
            </DraggableElement>
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
                fontFamily: fonts.heading 
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
                fontFamily: fonts.heading 
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
                  style={{ fontFamily: fonts.body }}
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
                  style={{ fontFamily: fonts.body }}
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
                  style={{ fontFamily: fonts.body }}
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
