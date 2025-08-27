import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { WeddingCardData, CardElements, ElementPosition, Template } from '@/types';
import { templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';
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
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Fetch template (static or custom)
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!cardData.templateId) {
        setLoading(false);
        return;
      }

      // First check static templates
      const staticTemplate = templates.find(t => t.id === cardData.templateId);
      if (staticTemplate) {
        setTemplate(staticTemplate);
        setLoading(false);
        return;
      }

      // Then check custom templates
      try {
        const { data, error } = await supabase
          .from('custom_templates')
          .select('*')
          .eq('id', cardData.templateId)
          .single();

        if (error) {
          console.error('Error fetching custom template:', error);
          setTemplate(null);
        } else {
          const customTemplate: Template = {
            id: data.id,
            name: data.name,
            category: 'custom' as const,
            thumbnail: data.background_image || '/placeholder.svg',
            isPremium: data.is_premium,
            colors: data.colors as any,
            fonts: data.fonts as any,
            layouts: ['custom'],
            supportsMultiPhoto: true,
            supportsVideo: false,
            backgroundImage: data.background_image,
            defaultPositions: data.default_positions as any,
            tags: data.tags || []
          };
          setTemplate(customTemplate);
        }
      } catch (error) {
        console.error('Error fetching custom template:', error);
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [cardData.templateId]);
  
  const [positions, setPositions] = useState<CardElements>(() => {
    if (initialPositions) return initialPositions;
    return defaultPositions;
  });

  // Update positions when template loads and has default positions
  useEffect(() => {
    if (template?.defaultPositions && !initialPositions) {
      const basePositions = {
        ...template.defaultPositions,
        photo: template.defaultPositions.photo || defaultPositions.photo,
        photos: []
      };

      // Initialize photos array for multiple images
      if (cardData.uploadedImages && Array.isArray(cardData.uploadedImages) && cardData.uploadedImages.length > 0) {
        if (cardData.uploadedImages.length === 1) {
          setPositions({ ...basePositions, photos: [] });
        } else {
          const photosArray = cardData.uploadedImages.map((_, index) => ({
            id: `photo-${index}`,
            position: { 
              x: (index % 2 === 0 ? -70 : 70) + (index * 15), 
              y: -140 + (Math.floor(index / 2) * 160) 
            },
            size: { width: 100, height: 100 }
          }));
          
          setPositions({ ...basePositions, photos: photosArray });
        }
      } else {
        setPositions(basePositions);
      }
    }
  }, [template, cardData.uploadedImages, initialPositions]);

  const [history, setHistory] = useState<CardElements[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([positions]);
      setHistoryIndex(0);
    }
  }, []);

  // Debug photos
  useEffect(() => {
    console.log('Debug - cardData.uploadedImages:', cardData.uploadedImages);
    console.log('Debug - positions.photos:', positions.photos);
    
    // Reinitialize photos when uploadedImages changes
    if (cardData.uploadedImages && Array.isArray(cardData.uploadedImages) && cardData.uploadedImages.length > 1) {
      const photosArray = cardData.uploadedImages.map((_, index) => ({
        id: `photo-${index}`,
        position: { 
          x: (index % 2 === 0 ? -70 : 70) + (index * 15), 
          y: -140 + (Math.floor(index / 2) * 160) 
        },
        size: { width: 100, height: 100 }
      }));
      
      if (!positions.photos || positions.photos.length !== cardData.uploadedImages.length) {
        setPositions(prev => ({ ...prev, photos: photosArray }));
      }
    }
  }, [cardData.uploadedImages]);

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
      photos: cardData.uploadedImages && Array.isArray(cardData.uploadedImages) && cardData.uploadedImages.length > 1 
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

  if (loading) {
    return (
      <Card className="aspect-[3/4] p-8 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <h3 className="text-lg font-medium text-muted-foreground">Loading Template</h3>
            <p className="text-sm text-muted-foreground/70">Please wait...</p>
          </div>
        </div>
      </Card>
    );
  }

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
      {/* Mode Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-muted/50 p-1 rounded-xl border shadow-sm">
          <button
            onClick={() => setIsEditMode(false)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              !isEditMode 
                ? 'bg-background text-foreground shadow-sm border' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            👁️ View Mode
          </button>
          <button
            onClick={() => setIsEditMode(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isEditMode 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            ✏️ Edit Mode
          </button>
        </div>
      </div>

      {/* Premium Control Panel - Only show in edit mode */}
      {isEditMode && (
        <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                <Move className="h-3 w-3 mr-1" />
                Edit Mode Active
              </Badge>
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
      )}

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
            isEditMode ? (
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
            ) : (
              <div 
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${positions.logo.x}px, ${positions.logo.y}px)`,
                  zIndex: 10
                }}
              >
                <img 
                  src={cardData.logoImage} 
                  alt="Wedding Logo" 
                  className="w-20 h-20 object-contain opacity-90 filter drop-shadow-sm"
                />
              </div>
            )
          )}

          {/* Photos */}
          {cardData.uploadedImages && Array.isArray(cardData.uploadedImages) && cardData.uploadedImages.length > 0 && (
            <>
              {cardData.uploadedImages.length === 1 ? (
                isEditMode ? (
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
                  <div 
                    className={`absolute border-4 border-white/90 shadow-xl transition-all duration-200 ${
                      cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                      cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                      'rounded-xl'
                    }`}
                    style={{ 
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${positions.photo.position.x}px, ${positions.photo.position.y}px)`,
                      width: `${positions.photo.size.width}px`,
                      height: `${positions.photo.size.height}px`,
                      backgroundImage: `url(${cardData.uploadedImages[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      zIndex: 10
                    }}
                  />
                )
              ) : (
                positions.photos?.map((photo, index) => (
                  cardData.uploadedImages && cardData.uploadedImages[index] && (
                    isEditMode ? (
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
                    ) : (
                      <div 
                        key={photo.id}
                        className={`absolute border-3 border-white/90 shadow-lg transition-all duration-200 ${
                          cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                          cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                          'rounded-lg'
                        }`}
                        style={{ 
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${photo.position.x}px, ${photo.position.y}px)`,
                          width: `${photo.size.width}px`,
                          height: `${photo.size.height}px`,
                          backgroundImage: `url(${cardData.uploadedImages[index]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          zIndex: 10
                        }}
                      />
                    )
                  )
                ))
              )}
            </>
          )}

          {/* Bride's Name */}
          {isEditMode ? (
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
          ) : (
            <h1 
              className="absolute text-4xl font-bold leading-tight text-center drop-shadow-sm"
              style={{ 
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${positions.brideName.x}px, ${positions.brideName.y}px)`,
                color: colors.primary,
                fontFamily: getFontFamily('heading'),
                zIndex: 10
              }}
            >
              {cardData.brideName || 'Bride\'s Name'}
            </h1>
          )}

          {/* Heart Icon */}
          {isEditMode ? (
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
          ) : (
            <div 
              className="absolute flex items-center justify-center"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${positions.heartIcon.x}px, ${positions.heartIcon.y}px)`,
                zIndex: 10
              }}
            >
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
          )}

          {/* Groom's Name */}
          {isEditMode ? (
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
          ) : (
            <h1 
              className="absolute text-4xl font-bold leading-tight text-center drop-shadow-sm"
              style={{ 
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${positions.groomName.x}px, ${positions.groomName.y}px)`,
                color: colors.primary,
                fontFamily: getFontFamily('heading'),
                zIndex: 10
              }}
            >
              {cardData.groomName || 'Groom\'s Name'}
            </h1>
          )}
          {/* Wedding Date */}
          {cardData.weddingDate && (
            isEditMode ? (
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
            ) : (
              <div 
                className="absolute flex items-center justify-center transition-all duration-200"
                style={{ 
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${positions.weddingDate.x}px, ${positions.weddingDate.y}px)`,
                  color: colors.text,
                  zIndex: 10
                }}
              >
                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium text-sm"
                  style={{ fontFamily: getFontFamily('date') }}
                >
                  {formatDate(cardData.weddingDate)}
                </span>
              </div>
            )
          )}

          {/* Venue */}
          {cardData.venue && (
            isEditMode ? (
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
            ) : (
              <div 
                className="absolute flex items-center justify-center transition-all duration-200"
                style={{ 
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${positions.venue.x}px, ${positions.venue.y}px)`,
                  color: colors.text,
                  zIndex: 10
                }}
              >
                <MapPin className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium text-sm"
                  style={{ fontFamily: getFontFamily('venue') }}
                >
                  {cardData.venue}
                </span>
              </div>
            )
          )}
          {/* Message */}
          {cardData.message && (
            isEditMode ? (
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
            ) : (
              <p 
                className="absolute text-center text-sm italic leading-relaxed max-w-xs transition-all duration-200"
                style={{ 
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${positions.message.x}px, ${positions.message.y}px)`,
                  color: colors.text,
                  fontFamily: getFontFamily('message'),
                  zIndex: 10
                }}
              >
                {cardData.message}
              </p>
            )
          )}
        </div>
      </Card>
    </div>
  );
};

export default PremiumCardEditor;