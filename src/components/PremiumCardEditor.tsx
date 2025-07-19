import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Undo2, 
  Redo2, 
  RotateCcw,
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { WeddingCardData, CardElements, ElementPosition } from '@/types';
import { templates } from '@/data/templates';
import PremiumDraggableElement from './PremiumDraggableElement';

interface PremiumCardEditorProps {
  cardData: WeddingCardData;
  initialPositions?: CardElements | null;
  onPositionsUpdate?: (positions: CardElements) => void;
}

const defaultPositions: CardElements = {
  brideName: { x: 0, y: -60 },
  groomName: { x: 0, y: 60 },
  heartIcon: { x: 0, y: 0 },
  weddingDate: { x: 0, y: 140 },
  venue: { x: 0, y: 170 },
  message: { x: 0, y: 220 },
  photo: { 
    position: { x: 0, y: -140 },
    size: { width: 120, height: 120 }
  },
  photos: [],
  logo: { x: 0, y: -200 },
};

const PremiumCardEditor = ({ cardData, initialPositions, onPositionsUpdate }: PremiumCardEditorProps) => {
  const template = templates.find(t => t.id === cardData.templateId);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [positions, setPositions] = useState<CardElements>(() => {
    if (initialPositions) return initialPositions;
    
    const basePositions = template?.defaultPositions ? {
      ...template.defaultPositions,
      photo: template.defaultPositions.photo || defaultPositions.photo,
      photos: []
    } : defaultPositions;

    // Initialize photos array for multiple images
    if (cardData.uploadedImages && cardData.uploadedImages.length > 1) {
      const photosArray = cardData.uploadedImages.map((_, index) => ({
        id: `photo-${index}`,
        position: { 
          x: (index % 2 === 0 ? -70 : 70) + (index * 15), 
          y: -140 + (Math.floor(index / 2) * 160) 
        },
        size: { width: 100, height: 100 }
      }));
      
      return { ...basePositions, photos: photosArray };
    }
    
    return basePositions;
  });

  const [history, setHistory] = useState<CardElements[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([positions]);
      setHistoryIndex(0);
    }
  }, []);

  // Update parent when positions change
  useEffect(() => {
    onPositionsUpdate?.(positions);
  }, [positions, onPositionsUpdate]);

  const addToHistory = useCallback((newPositions: CardElements) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newPositions);
      
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(newHistory.length - 1);
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      return newHistory;
    });
  }, [historyIndex]);

  const handleElementMove = useCallback((elementId: string, newPosition: ElementPosition) => {
    setPositions(prev => {
      let newPositions: CardElements;

      if (elementId.startsWith('photo-')) {
        newPositions = {
          ...prev,
          photos: prev.photos?.map(photo => 
            photo.id === elementId 
              ? { ...photo, position: newPosition }
              : photo
          ) || []
        };
      } else {
        newPositions = {
          ...prev,
          [elementId]: elementId === 'photo' 
            ? { ...prev.photo, position: newPosition }
            : newPosition
        };
      }

      addToHistory(newPositions);
      return newPositions;
    });
  }, [addToHistory]);

  const handleElementResize = useCallback((elementId: string, newSize: { width: number; height: number }) => {
    setPositions(prev => {
      let newPositions: CardElements;

      if (elementId.startsWith('photo-')) {
        newPositions = {
          ...prev,
          photos: prev.photos?.map(photo =>
            photo.id === elementId
              ? { ...photo, size: newSize }
              : photo
          ) || []
        };
      } else {
        newPositions = {
          ...prev,
          photo: { ...prev.photo, size: newSize }
        };
      }

      addToHistory(newPositions);
      return newPositions;
    });
  }, [addToHistory]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPositions(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPositions(history[newIndex]);
    }
  };

  const reset = () => {
    const defaultPos = template?.defaultPositions ? {
      ...template.defaultPositions,
      photo: template.defaultPositions.photo || defaultPositions.photo,
      photos: cardData.uploadedImages && cardData.uploadedImages.length > 1 
        ? cardData.uploadedImages.map((_, index) => ({
            id: `photo-${index}`,
            position: { 
              x: (index % 2 === 0 ? -70 : 70) + (index * 15), 
              y: -140 + (Math.floor(index / 2) * 160) 
            },
            size: { width: 100, height: 100 }
          }))
        : []
    } : defaultPositions;

    setPositions(defaultPos);
    setHistory([defaultPos]);
    setHistoryIndex(0);
    setSelectedElement(null);
  };

  if (!template) {
    return (
      <Card className="aspect-[3/4] p-8 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
        <div className="text-center space-y-4">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
          <div>
            <h3 className="text-lg font-medium text-muted-foreground">Select a Template</h3>
            <p className="text-sm text-muted-foreground/70">Choose a beautiful template to start designing</p>
          </div>
        </div>
      </Card>
    );
  }

  const colors = {
    primary: cardData.customization?.colors?.primary || template.colors.primary,
    secondary: cardData.customization?.colors?.secondary || template.colors.secondary,
    accent: cardData.customization?.colors?.accent || template.colors.accent,
    text: cardData.customization?.colors?.text || '#1f2937'
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
      background: `linear-gradient(135deg, ${colors.secondary}15 0%, ${colors.primary}08 100%)`
    };
  };

  return (
    <div className="space-y-6">
      {/* Premium Control Panel */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              <Move className="h-3 w-3 mr-1" />
              Edit Mode
            </Badge>
            {selectedElement && (
              <Badge variant="outline" className="text-xs">
                Selected: {selectedElement}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={undo}
              disabled={historyIndex <= 0}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              onClick={reset}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Premium Card Preview */}
      <Card 
        id="card-preview"
        ref={cardRef}
        className="aspect-[3/4] overflow-hidden relative group shadow-2xl border-0 bg-white"
        style={getBackgroundStyle()}
      >
        {/* Decorative Elements */}
        {!template?.backgroundImage && (
          <>
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ backgroundColor: colors.primary }}
            />
          </>
        )}

        <div className="relative h-full flex items-center justify-center p-8">
          {/* Logo */}
          {cardData.logoImage && (
            <PremiumDraggableElement
              id="logo"
              position={positions.logo}
              onMove={handleElementMove}
              containerRef={cardRef}
              isSelected={selectedElement === 'logo'}
              onSelect={setSelectedElement}
            >
              <div className="relative">
                <img 
                  src={cardData.logoImage} 
                  alt="Wedding Logo" 
                  className="w-20 h-20 object-contain opacity-90 filter drop-shadow-sm"
                />
              </div>
            </PremiumDraggableElement>
          )}

          {/* Photos */}
          {cardData.uploadedImages && cardData.uploadedImages.length > 0 && (
            <>
              {cardData.uploadedImages.length === 1 ? (
                <PremiumDraggableElement
                  id="photo"
                  position={positions.photo.position}
                  onMove={handleElementMove}
                  containerRef={cardRef}
                  resizable={true}
                  size={positions.photo.size}
                  onResize={handleElementResize}
                  isSelected={selectedElement === 'photo'}
                  onSelect={setSelectedElement}
                  minSize={{ width: 80, height: 80 }}
                  maxSize={{ width: 240, height: 240 }}
                  maintainAspectRatio={true}
                >
                  <div 
                    className={`w-full h-full border-4 border-white/90 shadow-xl transition-all duration-200 ${
                      cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                      cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                      'rounded-xl'
                    } ${selectedElement === 'photo' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    style={{ 
                      backgroundImage: `url(${cardData.uploadedImages[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </PremiumDraggableElement>
              ) : (
                positions.photos?.map((photo, index) => (
                  cardData.uploadedImages && cardData.uploadedImages[index] && (
                    <PremiumDraggableElement
                      key={photo.id}
                      id={photo.id}
                      position={photo.position}
                      onMove={handleElementMove}
                      containerRef={cardRef}
                      resizable={true}
                      size={photo.size}
                      onResize={handleElementResize}
                      isSelected={selectedElement === photo.id}
                      onSelect={setSelectedElement}
                      minSize={{ width: 60, height: 60 }}
                      maxSize={{ width: 180, height: 180 }}
                      maintainAspectRatio={true}
                    >
                      <div 
                        className={`w-full h-full border-3 border-white/90 shadow-lg transition-all duration-200 ${
                          cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                          cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                          'rounded-lg'
                        } ${selectedElement === photo.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        style={{ 
                          backgroundImage: `url(${cardData.uploadedImages[index]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </PremiumDraggableElement>
                  )
                ))
              )}
            </>
          )}

          {/* Bride's Name */}
          <PremiumDraggableElement
            id="brideName"
            position={positions.brideName}
            onMove={handleElementMove}
            containerRef={cardRef}
            isSelected={selectedElement === 'brideName'}
            onSelect={setSelectedElement}
          >
            <h1 
              className={`text-4xl font-bold leading-tight text-center transition-all duration-200 ${
                selectedElement === 'brideName' ? 'drop-shadow-lg' : 'drop-shadow-sm'
              }`}
              style={{ 
                color: colors.primary,
                fontFamily: getFontFamily('heading')
              }}
            >
              {cardData.brideName || 'Bride\'s Name'}
            </h1>
          </PremiumDraggableElement>

          {/* Heart Icon */}
          <PremiumDraggableElement
            id="heartIcon"
            position={positions.heartIcon}
            onMove={handleElementMove}
            containerRef={cardRef}
            isSelected={selectedElement === 'heartIcon'}
            onSelect={setSelectedElement}
          >
            <div className="flex items-center justify-center">
              <div 
                className="h-px w-12 transition-all duration-200"
                style={{ backgroundColor: `${colors.primary}60` }}
              />
              <Heart 
                className="h-5 w-5 mx-4 transition-all duration-200" 
                fill={`${colors.primary}90`}
                style={{ color: `${colors.primary}90` }}
              />
              <div 
                className="h-px w-12 transition-all duration-200"
                style={{ backgroundColor: `${colors.primary}60` }}
              />
            </div>
          </PremiumDraggableElement>

          {/* Groom's Name */}
          <PremiumDraggableElement
            id="groomName"
            position={positions.groomName}
            onMove={handleElementMove}
            containerRef={cardRef}
            isSelected={selectedElement === 'groomName'}
            onSelect={setSelectedElement}
          >
            <h1 
              className={`text-4xl font-bold leading-tight text-center transition-all duration-200 ${
                selectedElement === 'groomName' ? 'drop-shadow-lg' : 'drop-shadow-sm'
              }`}
              style={{ 
                color: colors.primary,
                fontFamily: getFontFamily('heading')
              }}
            >
              {cardData.groomName || 'Groom\'s Name'}
            </h1>
          </PremiumDraggableElement>

          {/* Wedding Date */}
          {cardData.weddingDate && (
            <PremiumDraggableElement
              id="weddingDate"
              position={positions.weddingDate}
              onMove={handleElementMove}
              containerRef={cardRef}
              isSelected={selectedElement === 'weddingDate'}
              onSelect={setSelectedElement}
            >
              <div 
                className="flex items-center justify-center transition-all duration-200" 
                style={{ color: colors.text }}
              >
                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium text-sm"
                  style={{ fontFamily: getFontFamily('date') }}
                >
                  {formatDate(cardData.weddingDate)}
                </span>
              </div>
            </PremiumDraggableElement>
          )}

          {/* Venue */}
          {cardData.venue && (
            <PremiumDraggableElement
              id="venue"
              position={positions.venue}
              onMove={handleElementMove}
              containerRef={cardRef}
              isSelected={selectedElement === 'venue'}
              onSelect={setSelectedElement}
            >
              <div 
                className="flex items-center justify-center transition-all duration-200" 
                style={{ color: colors.text }}
              >
                <MapPin className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium text-sm"
                  style={{ fontFamily: getFontFamily('venue') }}
                >
                  {cardData.venue}
                </span>
              </div>
            </PremiumDraggableElement>
          )}

          {/* Message */}
          {cardData.message && (
            <PremiumDraggableElement
              id="message"
              position={positions.message}
              onMove={handleElementMove}
              containerRef={cardRef}
              isSelected={selectedElement === 'message'}
              onSelect={setSelectedElement}
            >
              <p 
                className="text-center text-sm italic leading-relaxed max-w-xs transition-all duration-200"
                style={{ 
                  color: colors.text,
                  fontFamily: getFontFamily('message')
                }}
              >
                {cardData.message}
              </p>
            </PremiumDraggableElement>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PremiumCardEditor;