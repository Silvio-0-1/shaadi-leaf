import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Calendar, 
  MapPin,
  Move
} from 'lucide-react';
import { WeddingCardData, CardElements, ElementPosition, Template, IndividualPhotoElement } from '@/types';
import { templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';
import AdvancedDraggableElement from './AdvancedDraggableElement';
import InlineTextEditor from './InlineTextEditor';
import EditorToolbar from './EditorToolbar';
import GridOverlay from './GridOverlay';
import ObjectToolbar from './ObjectToolbar';
import { toast } from 'sonner';

// Force cache refresh - Enhanced Card Editor v2.0

interface EnhancedCardEditorProps {
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

const EnhancedCardEditor = ({ cardData, initialPositions, onPositionsUpdate, onDataChange }: EnhancedCardEditorProps) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // Debug selection changes
  useEffect(() => {
    console.log('🔵 Selected element changed to:', selectedElement);
  }, [selectedElement]);
  
  // Editor state
  const [showGridlines, setShowGridlines] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [gridSize] = useState(30);
  const [elementZIndices, setElementZIndices] = useState<Record<string, number>>({});
  const [elementRotations, setElementRotations] = useState<Record<string, number>>({});
  const [elementLockStates, setElementLockStates] = useState<Record<string, boolean>>({});
  const [elementFontSizes, setElementFontSizes] = useState<Record<string, number>>({
    brideName: 36,
    groomName: 36,
    weddingDate: 14,
    venue: 14,
    message: 16
  });
  const [elementSizes, setElementSizes] = useState<Record<string, { width: number; height: number }>>({});
  
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
      } else if (elementId === 'photo') {
        newPositions = {
          ...prev,
          photo: { ...prev.photo, size: newSize }
        };
      } else {
        // For text elements, scale font size based on width change
        const isTextElement = ['brideName', 'groomName', 'weddingDate', 'venue', 'message'].includes(elementId);
        if (isTextElement) {
          const baseFontSizes = {
            brideName: 36,
            groomName: 36,
            weddingDate: 14,
            venue: 14,
            message: 16
          };
          
          const baseSizes = {
            brideName: 200,
            groomName: 200,
            weddingDate: 180,
            venue: 160,
            message: 220
          };
          
          const scaleRatio = newSize.width / (baseSizes[elementId as keyof typeof baseSizes] || 200);
          const newFontSize = Math.max(8, Math.min(72, (baseFontSizes[elementId as keyof typeof baseFontSizes] || 16) * scaleRatio));
          
          setElementFontSizes(prev => ({
            ...prev,
            [elementId]: newFontSize
          }));
        }
        
        // Update element sizes tracking
        setElementSizes(prev => ({ ...prev, [elementId]: newSize }));
        
        newPositions = prev;
      }

      addToHistory(newPositions);
      return newPositions;
    });
  }, [addToHistory, elementSizes]);

  const handleElementRotate = useCallback((elementId: string, rotation: number) => {
    setElementRotations(prev => ({
      ...prev,
      [elementId]: rotation
    }));
  }, []);

  const handleTextChange = useCallback((field: keyof WeddingCardData, value: string) => {
    onDataChange?.({ [field]: value });
  }, [onDataChange]);

  const handleDoubleClick = useCallback((elementId: string) => {
    if (editingElement && editingElement !== elementId) {
      return;
    }
    setEditingElement(editingElement === elementId ? null : elementId);
  }, [editingElement]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPositions(history[newIndex]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPositions(history[newIndex]);
    }
  }, [historyIndex, history]);

  const reset = useCallback(() => {
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
  }, [template, cardData.uploadedImages]);

  // Enhanced toolbar functions
  const handleDeleteElement = useCallback((elementId: string) => {
    // Only allow deletion of photos and logos, not text elements
    if (elementId.startsWith('photo-') || elementId === 'logo') {
      if (elementId.startsWith('photo-')) {
        setPositions(prev => ({
          ...prev,
          photos: prev.photos?.filter(photo => photo.id !== elementId) || []
        }));
      } else if (elementId === 'logo') {
        onDataChange?.({ logoImage: undefined });
      }
      setSelectedElement(null);
    } else {
      toast.error('Text elements cannot be deleted');
    }
  }, [onDataChange]);

  const handleBringToFront = useCallback((elementId: string) => {
    setElementZIndices(prev => ({
      ...prev,
      [elementId]: Math.max(...Object.values(prev), 20) + 1
    }));
  }, []);

  const handleSendToBack = useCallback((elementId: string) => {
    setElementZIndices(prev => ({
      ...prev,
      [elementId]: Math.min(...Object.values(prev), 10) - 1
    }));
  }, []);

  const handleToggleLock = useCallback((elementId: string) => {
    setElementLockStates(prev => ({
      ...prev,
      [elementId]: !prev[elementId]
    }));
  }, []);

  const handleCenterHorizontally = useCallback((elementId: string) => {
    handleElementMove(elementId, { 
      ...getElementPosition(elementId), 
      x: 0 
    });
  }, [handleElementMove]);

  const handleCenterVertically = useCallback((elementId: string) => {
    handleElementMove(elementId, { 
      ...getElementPosition(elementId), 
      y: 0 
    });
  }, [handleElementMove]);

  const handleCenterBoth = useCallback((elementId: string) => {
    handleElementMove(elementId, { x: 0, y: 0 });
  }, [handleElementMove]);

  const handleDuplicateElement = useCallback((elementId: string) => {
    if (elementId.startsWith('photo-')) {
      const photoIndex = parseInt(elementId.split('-')[1]);
      if (cardData.uploadedImages && cardData.uploadedImages[photoIndex]) {
        const newPhotoId = `photo-${Date.now()}`;
        const originalPhoto = positions.photos?.find(p => p.id === elementId);
        if (originalPhoto) {
          const newPhoto = {
            id: newPhotoId,
            position: { 
              x: originalPhoto.position.x + 20, 
              y: originalPhoto.position.y + 20 
            },
            size: { ...originalPhoto.size }
          };
          
          setPositions(prev => ({
            ...prev,
            photos: [...(prev.photos || []), newPhoto]
          }));
          
          // Also duplicate the image in the array
          const newImages = [...(cardData.uploadedImages || [])];
          newImages.push(cardData.uploadedImages[photoIndex]);
          onDataChange?.({ uploadedImages: newImages });
        }
      }
    }
  }, [cardData.uploadedImages, positions.photos, onDataChange]);

  const getElementPosition = (elementId: string): ElementPosition => {
    if (elementId.startsWith('photo-')) {
      const photo = positions.photos?.find(p => p.id === elementId);
      return photo ? photo.position : { x: 0, y: 0 };
    }
    if (elementId === 'photo') {
      return positions.photo.position;
    }
    return positions[elementId as keyof CardElements] as ElementPosition;
  };

  const getAllElements = useCallback(() => {
    const elements: Array<{ id: string; position: ElementPosition; size?: { width: number; height: number } }> = [];
    
    Object.entries(positions).forEach(([key, value]) => {
      if (key === 'photo') {
        elements.push({ 
          id: key, 
          position: value.position, 
          size: value.size 
        });
      } else if (key === 'photos' && Array.isArray(value)) {
        value.forEach(photo => {
          elements.push({ 
            id: photo.id, 
            position: photo.position, 
            size: photo.size 
          });
        });
      } else if (typeof value === 'object' && 'x' in value && 'y' in value) {
        elements.push({ 
          id: key, 
          position: value as ElementPosition 
        });
      }
    });
    
    return elements;
  }, [positions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingElement) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        handleDeleteElement(selectedElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingElement, undo, redo, selectedElement, handleDeleteElement]);

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
      {/* Enhanced Control Panel */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-medium">
            <Move className="h-3 w-3 mr-1" />
            Enhanced Editor
          </Badge>
        </div>
        
        <EditorToolbar
          showGridlines={showGridlines}
          onToggleGridlines={() => setShowGridlines(!showGridlines)}
          snapToGrid={snapToGrid}
          onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
          showAlignmentGuides={showAlignmentGuides}
          onToggleAlignmentGuides={() => setShowAlignmentGuides(!showAlignmentGuides)}
          selectedElement={selectedElement}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={undo}
          onRedo={redo}
          onReset={reset}
          onDeleteElement={handleDeleteElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onCenterHorizontally={handleCenterHorizontally}
          onCenterVertically={handleCenterVertically}
          onCenterBoth={handleCenterBoth}
          onDuplicateElement={handleDuplicateElement}
        />
        
        {/* Object Toolbar in Editor Panel */}
        {selectedElement && (
          <ObjectToolbar
            selectedElement={selectedElement}
            elementLocked={elementLockStates[selectedElement] || false}
            onDelete={handleDeleteElement}
            onDuplicate={handleDuplicateElement}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onToggleLock={handleToggleLock}
            position={{ x: 0, y: 0 }}
            visible={true}
          />
        )}
      </div>

      {/* Enhanced Card Preview */}
      <Card 
        id="card-preview"
        ref={cardRef}
        className="aspect-[3/4] overflow-hidden relative group shadow-2xl border-0 bg-white rounded-none"
        style={getBackgroundStyle()}
        onClick={(e) => {
          // Deselect when clicking on empty space (not on any draggable element)
          const target = e.target as HTMLElement;
          
          // More robust detection - check if target or any parent has data-draggable-element
          const isDraggableElement = 
            target.hasAttribute('data-draggable-element') ||
            target.closest('[data-draggable-element]') !== null ||
            target.getAttribute('data-draggable-element') !== null ||
            !!target.closest('.absolute.select-none'); // Fallback to class-based detection
          
          console.log('🔴 Card onClick - target:', target.tagName, 'id:', target.id, 'classList:', target.classList.toString());
          console.log('🔴 Target data-draggable-element:', target.getAttribute('data-draggable-element'));
          console.log('🔴 Target data-container:', target.getAttribute('data-container'));
          console.log('🔴 Closest draggable element:', target.closest('[data-draggable-element]'));
          console.log('🔴 Closest by class:', target.closest('.absolute.select-none'));
          console.log('🔴 Final isDraggableElement:', isDraggableElement, 'currentSelected:', selectedElement);
          
          // Only deselect if clicking on card background (not on elements or main container)
          if (!isDraggableElement && !target.hasAttribute('data-container')) {
            console.log('🔴 Deselecting element because click was outside draggable elements');
            setSelectedElement(null);
          } else {
            console.log('🔴 Not deselecting - click was on draggable element or container');
          }
        }}
      >
        {/* Grid Overlay */}
        <GridOverlay 
          visible={showGridlines}
          gridSize={gridSize}
          containerRef={cardRef}
        />


        {/* Decorative Elements */}
        {!template?.backgroundImage && (
          <>
            <div 
              className="absolute top-0 left-0 right-0 h-1 z-0"
              style={{ backgroundColor: colors.primary }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 z-0"
              style={{ backgroundColor: colors.primary }}
            />
          </>
        )}

        <div className="relative h-full flex items-center justify-center p-8" data-container="card-elements">
          {/* Logo */}
          {cardData.logoImage && (
            <AdvancedDraggableElement
              id="logo"
              position={positions.logo}
              onMove={handleElementMove}
              containerRef={cardRef}
              isSelected={selectedElement === 'logo'}
              isLocked={elementLockStates.logo || false}
              onSelect={setSelectedElement}
              rotation={elementRotations.logo || 0}
              onRotate={handleElementRotate}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
              showAlignmentGuides={showAlignmentGuides}
              otherElements={getAllElements()}
              zIndex={elementZIndices.logo || 15}
            >
              <div className="relative">
                <img 
                  src={cardData.logoImage} 
                  alt="Wedding Logo" 
                  className="w-20 h-20 object-contain opacity-90 filter drop-shadow-sm"
                />
              </div>
            </AdvancedDraggableElement>
          )}

          {/* Photos */}
          {cardData.uploadedImages && Array.isArray(cardData.uploadedImages) && cardData.uploadedImages.length > 0 && (
            <>
              {cardData.uploadedImages.length === 1 ? (
                <AdvancedDraggableElement
                  id="photo"
                  position={positions.photo.position}
                  onMove={handleElementMove}
                  containerRef={cardRef}
                  resizable={true}
                  size={positions.photo.size}
                  rotation={elementRotations.photo || 0}
                  onResize={handleElementResize}
                  onRotate={handleElementRotate}
                  isSelected={selectedElement === 'photo'}
                  isLocked={elementLockStates.photo || false}
                  onSelect={setSelectedElement}
                  minSize={{ width: 80, height: 80 }}
                  maxSize={{ width: 240, height: 240 }}
                  maintainAspectRatio={true}
                  gridSize={gridSize}
                  snapToGrid={snapToGrid}
                  showAlignmentGuides={showAlignmentGuides}
                  otherElements={getAllElements()}
                  zIndex={elementZIndices.photo || 20}
                >
                  <div 
                    className={`w-full h-full border-4 border-white/90 shadow-xl transition-all duration-200 ${
                      cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                      cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                      'rounded-xl'
                    }`}
                    style={{ 
                      backgroundImage: `url(${cardData.uploadedImages[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                </AdvancedDraggableElement>
              ) : (
                positions.photos?.map((photo, index) => (
                  cardData.uploadedImages && cardData.uploadedImages[index] && (
                    <AdvancedDraggableElement
                      key={photo.id}
                      id={photo.id}
                      position={photo.position}
                      onMove={handleElementMove}
                      containerRef={cardRef}
                      resizable={true}
                      size={photo.size}
                      rotation={elementRotations[photo.id] || 0}
                      onResize={handleElementResize}
                      onRotate={handleElementRotate}
                      isSelected={selectedElement === photo.id}
                      isLocked={elementLockStates[photo.id] || false}
                      onSelect={setSelectedElement}
                      minSize={{ width: 60, height: 60 }}
                      maxSize={{ width: 180, height: 180 }}
                      maintainAspectRatio={true}
                      gridSize={gridSize}
                      snapToGrid={snapToGrid}
                      showAlignmentGuides={showAlignmentGuides}
                      otherElements={getAllElements()}
                      zIndex={elementZIndices[photo.id] || 20}
                    >
                      <div 
                        className={`w-full h-full border-3 border-white/90 shadow-lg transition-all duration-200 ${
                          cardData.customization?.photoShape === 'circle' ? 'rounded-full' :
                          cardData.customization?.photoShape === 'square' ? 'rounded-none' :
                          'rounded-lg'
                        }`}
                        style={{ 
                          backgroundImage: `url(${cardData.uploadedImages[index]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </AdvancedDraggableElement>
                  )
                ))
              )}
            </>
          )}

          {/* Bride's Name */}
          <AdvancedDraggableElement
            id="brideName"
            position={positions.brideName}
            onMove={handleElementMove}
            containerRef={cardRef}
            resizable={true}
            size={{ width: 200, height: 50 }}
            onResize={handleElementResize}
            isSelected={selectedElement === 'brideName'}
            isLocked={elementLockStates.brideName || false}
            onSelect={setSelectedElement}
            rotation={elementRotations.brideName || 0}
            onRotate={handleElementRotate}
            gridSize={gridSize}
            snapToGrid={snapToGrid}
            showAlignmentGuides={showAlignmentGuides}
            otherElements={getAllElements()}
            zIndex={elementZIndices.brideName || 30}
          >
            <div 
              onDoubleClick={() => handleDoubleClick('brideName')} 
              className="w-full h-full flex items-center justify-center"
              data-draggable-element="brideName"
            >
              {editingElement === 'brideName' ? (
                <InlineTextEditor
                  value={cardData.brideName || 'Bride\'s Name'}
                  onChange={(value) => handleTextChange('brideName', value)}
                  onComplete={() => setEditingElement(null)}
                  className="text-4xl font-bold text-center"
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading')
                  }}
                />
              ) : (
                <h1 
                  className={`font-bold leading-tight text-center transition-all duration-200 cursor-pointer ${
                    selectedElement === 'brideName' ? 'drop-shadow-lg' : 'drop-shadow-sm'
                  }`}
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${elementFontSizes.brideName || 36}px`
                  }}
                >
                  {cardData.brideName || 'Bride\'s Name'}
                </h1>
              )}
            </div>
          </AdvancedDraggableElement>

          {/* Heart Icon */}
          <AdvancedDraggableElement
            id="heartIcon"
            position={positions.heartIcon}
            onMove={handleElementMove}
            containerRef={cardRef}
            resizable={true}
            size={{ width: 100, height: 30 }}
            onResize={handleElementResize}
            isSelected={selectedElement === 'heartIcon'}
            isLocked={elementLockStates.heartIcon || false}
            onSelect={setSelectedElement}
            rotation={elementRotations.heartIcon || 0}
            onRotate={handleElementRotate}
            gridSize={gridSize}
            snapToGrid={snapToGrid}
            showAlignmentGuides={showAlignmentGuides}
            otherElements={getAllElements()}
            zIndex={elementZIndices.heartIcon || 25}
          >
            <div className="flex items-center justify-center w-full h-full" data-draggable-element="heartIcon">
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
          </AdvancedDraggableElement>

          {/* Groom's Name */}
          <AdvancedDraggableElement
            id="groomName"
            position={positions.groomName}
            onMove={handleElementMove}
            containerRef={cardRef}
            resizable={true}
            size={{ width: 200, height: 50 }}
            onResize={handleElementResize}
            isSelected={selectedElement === 'groomName'}
            isLocked={elementLockStates.groomName || false}
            onSelect={setSelectedElement}
            rotation={elementRotations.groomName || 0}
            onRotate={handleElementRotate}
            gridSize={gridSize}
            snapToGrid={snapToGrid}
            showAlignmentGuides={showAlignmentGuides}
            otherElements={getAllElements()}
            zIndex={elementZIndices.groomName || 30}
          >
            <div 
              onDoubleClick={() => handleDoubleClick('groomName')} 
              className="w-full h-full flex items-center justify-center"
              data-draggable-element="groomName"
            >
              {editingElement === 'groomName' ? (
                <InlineTextEditor
                  value={cardData.groomName || 'Groom\'s Name'}
                  onChange={(value) => handleTextChange('groomName', value)}
                  onComplete={() => setEditingElement(null)}
                  className="text-4xl font-bold text-center"
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading')
                  }}
                />
              ) : (
                <h1 
                  className={`font-bold leading-tight text-center transition-all duration-200 cursor-pointer ${
                    selectedElement === 'groomName' ? 'drop-shadow-lg' : 'drop-shadow-sm'
                  }`}
                  style={{ 
                    color: colors.primary,
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${elementFontSizes.groomName || 36}px`
                  }}
                >
                  {cardData.groomName || 'Groom\'s Name'}
                </h1>
              )}
            </div>
          </AdvancedDraggableElement>

          {/* Wedding Date */}
          {cardData.weddingDate && (
            <AdvancedDraggableElement
              id="weddingDate"
              position={positions.weddingDate}
              onMove={handleElementMove}
              containerRef={cardRef}
              resizable={true}
              size={{ width: 180, height: 40 }}
              onResize={handleElementResize}
              isSelected={selectedElement === 'weddingDate'}
              isLocked={elementLockStates.weddingDate || false}
              onSelect={setSelectedElement}
              rotation={elementRotations.weddingDate || 0}
              onRotate={handleElementRotate}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
              showAlignmentGuides={showAlignmentGuides}
              otherElements={getAllElements()}
              zIndex={elementZIndices.weddingDate || 25}
            >
              <div 
                className="flex items-center justify-center w-full h-full transition-all duration-200" 
                style={{ color: colors.text }}
                data-draggable-element="weddingDate"
              >
                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium"
                  style={{ 
                    fontFamily: getFontFamily('date'),
                    fontSize: `${elementFontSizes.weddingDate || 14}px`
                  }}
                >
                  {formatDate(cardData.weddingDate)}
                </span>
              </div>
            </AdvancedDraggableElement>
          )}

          {/* Venue */}
          {cardData.venue && (
            <AdvancedDraggableElement
              id="venue"
              position={positions.venue}
              onMove={handleElementMove}
              containerRef={cardRef}
              resizable={true}
              size={{ width: 160, height: 40 }}
              onResize={handleElementResize}
              isSelected={selectedElement === 'venue'}
              isLocked={elementLockStates.venue || false}
              onSelect={setSelectedElement}
              rotation={elementRotations.venue || 0}
              onRotate={handleElementRotate}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
              showAlignmentGuides={showAlignmentGuides}
              otherElements={getAllElements()}
              zIndex={elementZIndices.venue || 25}
            >
              <div 
                onDoubleClick={() => handleDoubleClick('venue')} 
                className="w-full h-full flex items-center justify-center"
                data-draggable-element="venue"
              >
                {editingElement === 'venue' ? (
                  <InlineTextEditor
                    value={cardData.venue}
                    onChange={(value) => handleTextChange('venue', value)}
                    onComplete={() => setEditingElement(null)}
                    className="text-sm font-medium text-center"
                    style={{ 
                      color: colors.text,
                      fontFamily: getFontFamily('venue')
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
                        fontSize: `${elementFontSizes.venue || 14}px`
                      }}
                    >
                      {cardData.venue}
                    </span>
                  </div>
                )}
              </div>
            </AdvancedDraggableElement>
          )}

          {/* Message */}
          {cardData.message && (
            <AdvancedDraggableElement
              id="message"
              position={positions.message}
              onMove={handleElementMove}
              containerRef={cardRef}
              resizable={true}
              size={{ width: 220, height: 60 }}
              onResize={handleElementResize}
              isSelected={selectedElement === 'message'}
              isLocked={elementLockStates.message || false}
              onSelect={setSelectedElement}
              rotation={elementRotations.message || 0}
              onRotate={handleElementRotate}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
              showAlignmentGuides={showAlignmentGuides}
              otherElements={getAllElements()}
              zIndex={elementZIndices.message || 25}
            >
              <div 
                onDoubleClick={() => handleDoubleClick('message')} 
                className="w-full h-full flex items-center justify-center"
                data-draggable-element="message"
              >
                {editingElement === 'message' ? (
                  <InlineTextEditor
                    value={cardData.message}
                    onChange={(value) => handleTextChange('message', value)}
                    onComplete={() => setEditingElement(null)}
                    isMultiline={true}
                    className="text-sm italic text-center max-w-xs"
                    style={{ 
                      color: colors.text,
                      fontFamily: getFontFamily('message')
                    }}
                  />
                ) : (
                  <p 
                    className="text-center italic leading-relaxed max-w-xs transition-all duration-200 cursor-pointer"
                    style={{ 
                      color: colors.text,
                      fontFamily: getFontFamily('message'),
                      fontSize: `${elementFontSizes.message || 16}px`
                    }}
                  >
                    {cardData.message}
                  </p>
                )}
              </div>
            </AdvancedDraggableElement>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EnhancedCardEditor;