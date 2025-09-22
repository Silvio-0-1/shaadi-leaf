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
import ResizableTextBox from './ResizableTextBox';
import InlineTextEditor from './InlineTextEditor';

interface PremiumCardEditorProps {
  cardData: WeddingCardData;
  initialPositions?: CardElements | null;
  onPositionsUpdate?: (positions: CardElements) => void;
  onDataChange?: (data: Partial<WeddingCardData>) => void;
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

const PremiumCardEditor = ({ cardData, initialPositions, onPositionsUpdate, onDataChange }: PremiumCardEditorProps) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  
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

  // State for text element sizes
  const [textSizes, setTextSizes] = useState<Record<string, { width: number; height: number }>>({
    brideName: { width: 200, height: 60 },
    groomName: { width: 200, height: 60 },
    weddingDate: { width: 180, height: 40 },
    venue: { width: 220, height: 50 },
    message: { width: 300, height: 80 }
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

  const handleTextResize = useCallback((elementId: string, size: { width: number; height: number }) => {
    setTextSizes(prev => ({
      ...prev,
      [elementId]: size
    }));
  }, []);

  const handleTextChange = useCallback((field: keyof WeddingCardData, value: string) => {
    onDataChange?.({ [field]: value });
  }, [onDataChange]);

  const handleDoubleClick = useCallback((elementId: string) => {
    // Prevent editing if already editing another element
    if (editingElement && editingElement !== elementId) {
      return;
    }
    setEditingElement(editingElement === elementId ? null : elementId);
  }, [editingElement]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not editing text
      if (editingElement) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingElement, historyIndex, history]);

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

  const handleFontSizeChange = useCallback((elementId: string, newFontSize: number) => {
    const fontSizeMap: { [key: string]: keyof NonNullable<typeof cardData.customization>['fontSizes'] } = {
      'brideName': 'brideNameSize',
      'groomName': 'groomNameSize',
      'weddingDate': 'dateSize',
      'venue': 'venueSize',
      'message': 'messageSize'
    };

    const fontSizeKey = fontSizeMap[elementId];
    if (!fontSizeKey) return;

    const updatedCustomization = {
      ...cardData.customization,
      fontSizes: {
        ...cardData.customization?.fontSizes,
        [fontSizeKey]: newFontSize
      }
    };

    onDataChange?.({ customization: updatedCustomization });
  }, [cardData.customization, onDataChange]);

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

  const getFontSize = (element: 'brideName' | 'groomName' | 'weddingDate' | 'venue' | 'message') => {
    const fontSizeMap = {
      'brideName': cardData.customization?.fontSizes?.brideNameSize || 24,
      'groomName': cardData.customization?.fontSizes?.groomNameSize || 24,
      'weddingDate': cardData.customization?.fontSizes?.dateSize || 14,
      'venue': cardData.customization?.fontSizes?.venueSize || 14,
      'message': cardData.customization?.fontSizes?.messageSize || 12
    };
    return fontSizeMap[element];
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
      {/* Control Panel */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              <Move className="h-3 w-3 mr-1" />
              Interactive Mode
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={undo}
              disabled={historyIndex <= 0}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              onClick={reset}
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              title="Reset to default positions"
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
          {cardData.uploadedImages && Array.isArray(cardData.uploadedImages) && cardData.uploadedImages.length > 0 && (
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
                    className={`w-full h-full shadow-xl transition-all duration-200 ${
                      cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                      cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                      'rounded-xl'
                    } ${selectedElement === 'photo' ? 'outline-2 outline-primary outline-offset-2' : ''}`}
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
                        className={`w-full h-full shadow-lg transition-all duration-200 ${
                          cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                          cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                          'rounded-lg'
                        } ${selectedElement === photo.id ? 'outline-2 outline-primary outline-offset-1' : ''}`}
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
          <ResizableTextBox
            id="brideName"
            position={positions.brideName}
            onMove={handleElementMove}
            onResize={handleTextResize}
            containerRef={cardRef}
            width={textSizes.brideName.width}
            height={textSizes.brideName.height}
            minWidth={100}
            maxWidth={400}
            minHeight={30}
            maxHeight={120}
            isSelected={selectedElement === 'brideName'}
            onSelect={setSelectedElement}
            customization={cardData.customization}
          >
            <div onDoubleClick={() => handleDoubleClick('brideName')}>
              {editingElement === 'brideName' ? (
                <InlineTextEditor
                  value={cardData.brideName || 'Bride\'s Name'}
                  onChange={(value) => handleTextChange('brideName', value)}
                  onComplete={() => setEditingElement(null)}
                  className="font-bold text-center"
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${getFontSize('brideName')}px`
                  }}
                />
              ) : (
                <h1 
                  className="font-bold leading-tight text-center transition-all duration-200 cursor-pointer"
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${getFontSize('brideName')}px`
                  }}
                >
                  {cardData.brideName || 'Bride\'s Name'}
                </h1>
              )}
            </div>
          </ResizableTextBox>

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
          <ResizableTextBox
            id="groomName"
            position={positions.groomName}
            onMove={handleElementMove}
            onResize={handleTextResize}
            containerRef={cardRef}
            width={textSizes.groomName.width}
            height={textSizes.groomName.height}
            minWidth={100}
            maxWidth={400}
            minHeight={30}
            maxHeight={120}
            isSelected={selectedElement === 'groomName'}
            onSelect={setSelectedElement}
            customization={cardData.customization}
          >
            <div onDoubleClick={() => handleDoubleClick('groomName')}>
              {editingElement === 'groomName' ? (
                <InlineTextEditor
                  value={cardData.groomName || 'Groom\'s Name'}
                  onChange={(value) => handleTextChange('groomName', value)}
                  onComplete={() => setEditingElement(null)}
                  className="font-bold text-center"
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${getFontSize('groomName')}px`
                  }}
                />
              ) : (
                <h1 
                  className="font-bold leading-tight text-center transition-all duration-200 cursor-pointer"
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${getFontSize('groomName')}px`
                  }}
                >
                  {cardData.groomName || 'Groom\'s Name'}
                </h1>
              )}
            </div>
          </ResizableTextBox>
          {/* Wedding Date */}
          {cardData.weddingDate && (
            <ResizableTextBox
              id="weddingDate"
              position={positions.weddingDate}
              onMove={handleElementMove}
              onResize={handleTextResize}
              containerRef={cardRef}
              width={textSizes.weddingDate.width}
              height={textSizes.weddingDate.height}
              minWidth={80}
              maxWidth={300}
              minHeight={25}
              maxHeight={80}
              isSelected={selectedElement === 'weddingDate'}
              onSelect={setSelectedElement}
              customization={cardData.customization}
            >
              <div 
                className="flex items-center justify-center transition-all duration-200" 
                style={{ color: colors.text }}
              >
                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium"
                  style={{ 
                    fontFamily: getFontFamily('date'),
                    fontSize: `${getFontSize('weddingDate')}px`
                  }}
                >
                  {formatDate(cardData.weddingDate)}
                </span>
              </div>
            </ResizableTextBox>
          )}

          {/* Venue */}
          {cardData.venue && (
            <ResizableTextBox
              id="venue"
              position={positions.venue}
              onMove={handleElementMove}
              onResize={handleTextResize}
              containerRef={cardRef}
              width={textSizes.venue.width}
              height={textSizes.venue.height}
              minWidth={100}
              maxWidth={350}
              minHeight={30}
              maxHeight={100}
              isSelected={selectedElement === 'venue'}
              onSelect={setSelectedElement}
              customization={cardData.customization}
            >
              <div onDoubleClick={() => handleDoubleClick('venue')}>
                {editingElement === 'venue' ? (
                  <InlineTextEditor
                    value={cardData.venue}
                    onChange={(value) => handleTextChange('venue', value)}
                    onComplete={() => setEditingElement(null)}
                    className="font-medium text-center"
                    style={{ 
                      color: colors.text,
                      fontFamily: getFontFamily('venue'),
                      fontSize: `${getFontSize('venue')}px`
                    }}
                  />
                ) : (
                  <div 
                    className="flex items-center justify-center transition-all duration-200 cursor-pointer" 
                    style={{ color: colors.text }}
                  >
                    <MapPin className="h-4 w-4 mr-2 opacity-70" />
                    <span 
                      className="font-medium"
                      style={{ 
                        fontFamily: getFontFamily('venue'),
                        fontSize: `${getFontSize('venue')}px`
                      }}
                    >
                      {cardData.venue}
                    </span>
                  </div>
                )}
              </div>
            </ResizableTextBox>
          )}
          {/* Message */}
          {cardData.message && (
            <ResizableTextBox
              id="message"
              position={positions.message}
              onMove={handleElementMove}
              onResize={handleTextResize}
              containerRef={cardRef}
              width={textSizes.message.width}
              height={textSizes.message.height}
              minWidth={150}
              maxWidth={300}
              minHeight={100}
              maxHeight={150}
              isSelected={selectedElement === 'message'}
              onSelect={setSelectedElement}
              customization={cardData.customization}
            >
              <div onDoubleClick={() => handleDoubleClick('message')}>
                {editingElement === 'message' ? (
                  <InlineTextEditor
                    value={cardData.message}
                    onChange={(value) => handleTextChange('message', value)}
                    onComplete={() => setEditingElement(null)}
                    isMultiline={true}
                    className="italic text-center max-w-xs"
                    style={{ 
                      color: colors.text,
                      fontFamily: getFontFamily('message'),
                      fontSize: `${getFontSize('message')}px`
                    }}
                  />
                ) : (
                  <p 
                    className="text-center italic leading-relaxed max-w-xs transition-all duration-200 cursor-pointer"
                    style={{ 
                      color: colors.text,
                      fontFamily: getFontFamily('message'),
                      fontSize: `${getFontSize('message')}px`
                    }}
                  >
                    {cardData.message}
                  </p>
                )}
              </div>
            </ResizableTextBox>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PremiumCardEditor;