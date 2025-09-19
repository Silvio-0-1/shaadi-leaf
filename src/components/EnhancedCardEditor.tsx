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
import ResizableTextBox from './ResizableTextBox';
import InlineTextEditor from './InlineTextEditor';
import EditorToolbar from './EditorToolbar';
import GridOverlay from './GridOverlay';
import ObjectToolbar from './ObjectToolbar';
import SelectionOverlay from './SelectionOverlay';
import SnapGuides from './SnapGuides';
import { useSnapController } from '@/hooks/useSnapController';
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
  const [lastSelectionTime, setLastSelectionTime] = useState<number>(0);
  
  // State for text element sizes
  const [textSizes, setTextSizes] = useState<Record<string, { width: number; height: number }>>({
    brideName: { width: 200, height: 60 },
    groomName: { width: 200, height: 60 },
    weddingDate: { width: 180, height: 40 },
    venue: { width: 220, height: 50 },
    message: { width: 300, height: 80 }
  });
  
  // Handle element selection with timing protection
  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElement(elementId);
    setLastSelectionTime(Date.now());
  }, []);
  
  // Editor state
  const [showGridlines, setShowGridlines] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [snapToCenter, setSnapToCenter] = useState(true);
  const [gridSize] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
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
  
  const [positions, setPositions] = useState<CardElements>(() => {
    if (initialPositions) return initialPositions;
    return defaultPositions;
  });

  // Container size for snap calculations
  const [containerSize, setContainerSize] = useState({ width: 600, height: 400 });

  // Update container size when the card ref changes
  useEffect(() => {
    const updateContainerSize = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    // Use a timeout to ensure DOM has settled
    const timer = setTimeout(updateContainerSize, 0);

    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateContainerSize);
    
    if (cardRef.current) {
      resizeObserver.observe(cardRef.current);
    }

    // Also listen to window resize as backup
    window.addEventListener('resize', updateContainerSize);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateContainerSize);
    };
  }, [template, cardData]); // Depend on template and cardData changes
  
  // Get other elements for alignment
  const getOtherElements = useCallback(() => {
    const elements = [];
    
    // Add text elements
    Object.entries(positions).forEach(([key, pos]) => {
      if (key !== 'photos' && key !== 'photo' && typeof pos === 'object' && 'x' in pos) {
        elements.push({
          id: key,
          position: pos as ElementPosition,
          size: elementSizes[key] || textSizes[key] || { width: 100, height: 50 }
        });
      }
    });
    
    // Add photo element
    if (positions.photo && cardData.uploadedImages && cardData.uploadedImages.length === 1) {
      elements.push({
        id: 'photo',
        position: positions.photo.position,
        size: positions.photo.size || { width: 120, height: 120 }
      });
    }
    
    // Add photos array
    if (positions.photos && cardData.uploadedImages && cardData.uploadedImages.length > 1) {
      positions.photos.forEach((photo) => {
        elements.push({
          id: photo.id,
          position: photo.position,
          size: photo.size || { width: 100, height: 100 }
        });
      });
    }
    
    return elements;
  }, [positions, elementSizes, textSizes, cardData.uploadedImages]);

  // Snap controller hook
  const snapController = useSnapController({
    enabled: snapToCenter,
    tolerance: 8,
    containerSize,
    otherElements: getOtherElements(),
  });
  
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

  // Sync font sizes from customization to element font sizes
  useEffect(() => {
    if (cardData.customization?.fontSizes) {
      const fontSizes = cardData.customization.fontSizes;
      setElementFontSizes(prev => ({
        ...prev,
        brideName: fontSizes.headingSize || prev.brideName,
        groomName: fontSizes.headingSize || prev.groomName,
        weddingDate: fontSizes.dateSize || prev.weddingDate,
        venue: fontSizes.venueSize || prev.venue,
        message: fontSizes.messageSize || prev.message
      }));
    }
  }, [cardData.customization?.fontSizes]);

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
    console.log('🎯 DRAG [handleElementMove]:', { elementId, position: newPosition });
    
    // Update guides during drag
    const elementSize = elementSizes[elementId] || textSizes[elementId] || { width: 100, height: 50 };
    snapController.updateGuides(elementId, newPosition, elementSize, true);
    
    // Apply snapping if enabled
    let finalPosition = newPosition;
    if (snapToCenter) {
      const snapResult = snapController.calculateSnap(elementId, newPosition, elementSize);
      finalPosition = snapResult.position;
    }
    
    setPositions(prev => {
      let newPositions: CardElements;

      if (elementId.startsWith('photo-')) {
        newPositions = {
          ...prev,
          photos: prev.photos?.map(photo => 
            photo.id === elementId 
              ? { ...photo, position: finalPosition }
              : photo
          ) || []
        };
      } else {
        newPositions = {
          ...prev,
          [elementId]: elementId === 'photo' 
            ? { ...prev.photo, position: finalPosition }
            : finalPosition
        };
      }

      addToHistory(newPositions);
      return newPositions;
    });
  }, [addToHistory, snapToCenter, snapController, elementSizes, textSizes]);

  // Handle drag start - set dragging state and initialize guides
  const handleDragStart = useCallback((elementId: string) => {
    console.log('🎯 DRAG START:', elementId);
    setIsDragging(true);
    setDraggingElementId(elementId);
  }, []);

  // Handle drag end - clear guides and reset state
  const handleDragEnd = useCallback((elementId: string) => {
    console.log('🎯 DRAG END:', elementId);
    setIsDragging(false);
    setDraggingElementId(null);
    snapController.clearGuides();
  }, [snapController]);

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
          const newFontSize = Math.max(8, Math.min(72, Math.round((baseFontSizes[elementId as keyof typeof baseFontSizes] || 16) * scaleRatio)));
          
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

  const handleTextResize = useCallback((elementId: string, size: { width: number; height: number }) => {
    setTextSizes(prev => ({
      ...prev,
      [elementId]: size
    }));
  }, []);

  const handleDoubleClick = useCallback((elementId: string) => {
    console.log('🟡 EnhancedCardEditor handleDoubleClick called for:', elementId, 'current editingElement:', editingElement);
    if (editingElement && editingElement !== elementId) {
      console.log('🔴 Blocking double-click because another element is being edited');
      return;
    }
    const newEditingElement = editingElement === elementId ? null : elementId;
    console.log('🟢 Setting editingElement to:', newEditingElement);
    setEditingElement(newEditingElement);
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
    const isDeletable = !['brideName', 'groomName'].includes(elementId);
    if (!isDeletable) {
      toast.error("Bride and Groom names cannot be deleted");
      return;
    }
    
    // Add current state to history before deletion
    addToHistory(positions);
    
    if (elementId.startsWith('photo-')) {
      // Remove photo from uploaded images
      const photoIndex = parseInt(elementId.replace('photo-', ''));
      const updatedImages = cardData.uploadedImages?.filter((_, index) => index !== photoIndex) || [];
      onDataChange({ uploadedImages: updatedImages });
    } else if (['weddingDate', 'venue', 'message'].includes(elementId)) {
      // Clear text content for deletable text elements
      const updates: Partial<WeddingCardData> = {};
      if (elementId === 'weddingDate') updates.weddingDate = '';
      if (elementId === 'venue') updates.venue = '';
      if (elementId === 'message') updates.message = '';
      onDataChange(updates);
    } else if (elementId === 'logo') {
      onDataChange({ logoImage: undefined });
    }
    
    setSelectedElement(null);
    toast.success("Element deleted");
  }, [positions, cardData.uploadedImages, onDataChange, addToHistory]);

  // Handle keyboard events for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        handleDeleteElement(selectedElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, handleDeleteElement]);

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
    console.log('Center horizontally called for:', elementId);
    
    setPositions(prev => {
      let currentPosition: ElementPosition;
      
      // Get current position from state
      if (elementId.startsWith('photo-')) {
        const photo = prev.photos?.find(p => p.id === elementId);
        currentPosition = photo ? photo.position : { x: 0, y: 0 };
      } else if (elementId === 'photo') {
        currentPosition = prev.photo.position;
      } else {
        currentPosition = prev[elementId as keyof CardElements] as ElementPosition;
      }
      
      console.log('Current position:', currentPosition);
      
      // Create new positions with x centered
      const newPosition = { ...currentPosition, x: 0 };
      
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
    
    toast.success('Element centered horizontally');
  }, [addToHistory]);

  const handleCenterVertically = useCallback((elementId: string) => {
    console.log('Center vertically called for:', elementId);
    
    setPositions(prev => {
      let currentPosition: ElementPosition;
      
      // Get current position from state
      if (elementId.startsWith('photo-')) {
        const photo = prev.photos?.find(p => p.id === elementId);
        currentPosition = photo ? photo.position : { x: 0, y: 0 };
      } else if (elementId === 'photo') {
        currentPosition = prev.photo.position;
      } else {
        currentPosition = prev[elementId as keyof CardElements] as ElementPosition;
      }
      
      console.log('Current position:', currentPosition);
      
      // Create new positions with y centered
      const newPosition = { ...currentPosition, y: 0 };
      
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
    
    toast.success('Element centered vertically');
  }, [addToHistory]);

  const handleCenterBoth = useCallback((elementId: string) => {
    console.log('Center both axes called for:', elementId);
    
    setPositions(prev => {
      const newPosition = { x: 0, y: 0 };
      
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
    
    toast.success('Element centered on both axes');
  }, [addToHistory]);

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
    toast.success("Element duplicated");
  }, [cardData.uploadedImages, positions.photos, onDataChange]);

  // Font controls
  const handleFontSizeChange = useCallback((elementId: string, newSize: number) => {
    setElementFontSizes(prev => ({ ...prev, [elementId]: newSize }));
    
    // Update customization based on element type
    const fontSizeKey = elementId === 'brideName' || elementId === 'groomName' ? 'headingSize' :
                       elementId === 'weddingDate' ? 'dateSize' :
                       elementId === 'venue' ? 'venueSize' :
                       elementId === 'message' ? 'messageSize' : null;
    
    if (fontSizeKey) {
      const updatedCustomization = {
        ...cardData.customization,
        fontSizes: {
          ...cardData.customization?.fontSizes,
          [fontSizeKey]: newSize
        }
      };
      onDataChange({ customization: updatedCustomization });
    }
    
    toast.success("Font size updated");
  }, [cardData.customization, onDataChange]);

  const handleFontFamilyChange = useCallback((elementId: string, newFamily: string) => {
    // Update customization based on element type
    const fontKey = elementId === 'brideName' || elementId === 'groomName' ? 'heading' :
                   elementId === 'weddingDate' ? 'date' :
                   elementId === 'venue' ? 'venue' :
                   elementId === 'message' ? 'message' : null;
    
    if (fontKey) {
      const updatedCustomization = {
        ...cardData.customization,
        fonts: {
          ...cardData.customization?.fonts,
          [fontKey]: newFamily
        }
      };
      onDataChange({ customization: updatedCustomization });
    }
    
    toast.success("Font family updated");
  }, [cardData.customization, onDataChange]);

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

  // Get text color from customization or default to template colors
  const getTextColor = (textType: string) => {
    const colorMapping = {
      'brideName': cardData.customization?.textColors?.brideName || colors.primary,
      'groomName': cardData.customization?.textColors?.groomName || colors.primary,
      'date': cardData.customization?.textColors?.date || colors.text,
      'venue': cardData.customization?.textColors?.venue || colors.text,
      'message': cardData.customization?.textColors?.message || colors.text
    };
    return colorMapping[textType as keyof typeof colorMapping];
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
        
        {/* Object Toolbar - always displayed in editor section */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
          <ObjectToolbar
            selectedElement={selectedElement}
            isElementLocked={elementLockStates[selectedElement] || false}
            visible={true}
            position={{ x: 0, y: 0 }} // Not used in this context
            onDuplicate={() => selectedElement && handleDuplicateElement(selectedElement)}
            onBringForward={() => selectedElement && handleBringToFront(selectedElement)}
            onSendBackward={() => selectedElement && handleSendToBack(selectedElement)}
            onToggleLock={() => selectedElement && handleToggleLock(selectedElement)}
            onDelete={() => selectedElement && handleDeleteElement(selectedElement)}
            fontSize={selectedElement ? elementFontSizes[selectedElement] || 
              (selectedElement === 'brideName' || selectedElement === 'groomName' ? 32 :
               selectedElement === 'weddingDate' ? 24 :
               selectedElement === 'venue' ? 20 :
               selectedElement === 'message' ? 16 : 16) : undefined}
            fontFamily={selectedElement ? getFontFamily(
              selectedElement === 'brideName' || selectedElement === 'groomName' ? 'heading' :
              selectedElement === 'weddingDate' ? 'date' :
              selectedElement === 'venue' ? 'venue' :
              selectedElement === 'message' ? 'message' : 'heading'
            ) : undefined}
            onFontSizeChange={(size) => selectedElement && handleFontSizeChange(selectedElement, size)}
            onFontFamilyChange={(family) => selectedElement && handleFontFamilyChange(selectedElement, family)}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={undo}
            onRedo={redo}
            onReset={reset}
            showGridlines={showGridlines}
            onToggleGridlines={() => setShowGridlines(!showGridlines)}
            snapToGrid={snapToGrid}
            onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
            showAlignmentGuides={showAlignmentGuides}
            onToggleAlignmentGuides={() => setShowAlignmentGuides(!showAlignmentGuides)}
            snapToCenter={snapToCenter}
            onToggleSnapToCenter={() => setSnapToCenter(!snapToCenter)}
            onCenterHorizontally={() => selectedElement && handleCenterHorizontally(selectedElement)}
            onCenterVertically={() => selectedElement && handleCenterVertically(selectedElement)}
            onCenterBoth={() => selectedElement && handleCenterBoth(selectedElement)}
          />
        </div>
      </div>

      {/* Enhanced Card Preview */}
      <Card 
        id="card-preview"
        ref={cardRef}
        className="aspect-[3/4] overflow-hidden relative group shadow-2xl border-0 bg-white rounded-none"
        style={getBackgroundStyle()}
        onClick={(e) => {
          // Only deselect if clicking directly on the card background, not on any elements
          const clickTarget = e.target as HTMLElement;
          const isClickingOnElement = clickTarget.closest('[data-draggable-element]') || 
                                     clickTarget.closest('.absolute') ||
                                     clickTarget.getAttribute('data-draggable-element');
          
          if (isClickingOnElement) {
            console.log('🟢 Clicking on element, not deselecting');
            return;
          }
          
          // Prevent immediate deselection by checking timing
          const now = Date.now();
          const timeSinceSelection = now - lastSelectionTime;
          
          // If an element was just selected (within 500ms), don't deselect it
          if (timeSinceSelection < 500) {
            console.log('🔴 Preventing deselection - element was just selected:', timeSinceSelection, 'ms ago');
            return;
          }
          
          // Deselect when clicking on empty space (not on any draggable element)
          const target = e.target as HTMLElement;
          
          // More robust detection - check if target or any parent has data-draggable-element
          const isDraggableElement = 
            target.hasAttribute('data-draggable-element') ||
            target.closest('[data-draggable-element]') !== null ||
            target.getAttribute('data-draggable-element') !== null ||
            !!target.closest('.absolute.select-none'); // Fallback to class-based detection
          
          console.log('🔴 Card onClick - timeSinceSelection:', timeSinceSelection, 'target:', target.tagName);
          
          // Only deselect if clicking on card background (not on elements)
          if (!isDraggableElement) {
            console.log('🔴 Deselecting element because click was outside draggable elements');
            setSelectedElement(null);
          } else {
            console.log('🔴 Not deselecting - click was on draggable element');
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

        <div className="relative h-full flex items-center justify-center p-8">
          {/* Snap Guides Overlay - Show always when enabled */}
          <SnapGuides 
            guides={snapController.snapGuides}
            containerSize={containerSize}
            snapTooltip={snapController.snapTooltip}
          />
          {/* Logo */}
          {cardData.logoImage && (
            <AdvancedDraggableElement
              id="logo"
              position={positions.logo}
              onMove={handleElementMove}
              containerRef={cardRef}
              isSelected={selectedElement === 'logo'}
              isLocked={elementLockStates.logo || false}
              onSelect={handleElementSelect}
              rotation={elementRotations.logo || 0}
              onRotate={handleElementRotate}
              gridSize={gridSize}
              snapToGrid={snapToGrid}
              showAlignmentGuides={showAlignmentGuides}
              otherElements={getAllElements()}
              zIndex={elementZIndices.logo || 15}
              onDragStart={() => handleDragStart('logo')}
              onDragEnd={() => handleDragEnd('logo')}
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
                  onSelect={handleElementSelect}
                  minSize={{ width: 80, height: 80 }}
                  maxSize={{ width: 240, height: 240 }}
                  maintainAspectRatio={true}
                  gridSize={gridSize}
                  snapToGrid={snapToGrid}
                  showAlignmentGuides={showAlignmentGuides}
                  otherElements={getAllElements()}
                  zIndex={elementZIndices.photo || 20}
                  onDragStart={() => handleDragStart('photo')}
                  onDragEnd={() => handleDragEnd('photo')}
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
                      onSelect={handleElementSelect}
                      minSize={{ width: 60, height: 60 }}
                      maxSize={{ width: 180, height: 180 }}
                      maintainAspectRatio={true}
                      gridSize={gridSize}
                      snapToGrid={snapToGrid}
                      showAlignmentGuides={showAlignmentGuides}
                      otherElements={getAllElements()}
                      zIndex={elementZIndices[photo.id] || 20}
                      onDragStart={() => handleDragStart(photo.id)}
                      onDragEnd={() => handleDragEnd(photo.id)}
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
            onSelect={handleElementSelect}
            customization={cardData.customization}
            rotation={elementRotations.brideName || 0}
            onRotate={handleElementRotate}
            onDragStart={() => handleDragStart('brideName')}
            onDragEnd={() => handleDragEnd('brideName')}
          >
            <div 
              className="w-full h-full flex items-center justify-center"
              data-draggable-element="brideName"
            >
              {editingElement === 'brideName' ? (
                <InlineTextEditor
                  value={cardData.brideName || 'Bride\'s Name'}
                  onChange={(value) => handleTextChange('brideName', value)}
                  onComplete={() => setEditingElement(null)}
                  className="text-center font-bold w-full"
                  style={{ 
                    color: getTextColor('brideName'),
                    fontFamily: getFontFamily('heading'),
                    fontSize: 'inherit'
                  }}
                />
              ) : (
                <h1 
                  className="font-bold leading-tight text-center transition-all duration-200 cursor-pointer"
                  onDoubleClick={() => handleDoubleClick('brideName')}
                  style={{ 
                    color: getTextColor('brideName'),
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${elementFontSizes.brideName || 36}px`
                  }}
                >
                  {cardData.brideName || 'Bride\'s Name'}
                </h1>
              )}
            </div>
          </ResizableTextBox>

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
            onSelect={handleElementSelect}
            rotation={elementRotations.heartIcon || 0}
            onRotate={handleElementRotate}
            gridSize={gridSize}
            snapToGrid={snapToGrid}
            showAlignmentGuides={showAlignmentGuides}
            otherElements={getAllElements()}
            zIndex={elementZIndices.heartIcon || 25}
            onDragStart={() => handleDragStart('heartIcon')}
            onDragEnd={() => handleDragEnd('heartIcon')}
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
            onSelect={handleElementSelect}
            customization={cardData.customization}
            rotation={elementRotations.groomName || 0}
            onRotate={handleElementRotate}
            onDragStart={() => handleDragStart('groomName')}
            onDragEnd={() => handleDragEnd('groomName')}
          >
            <div 
              className="w-full h-full flex items-center justify-center"
              data-draggable-element="groomName"
            >
              {editingElement === 'groomName' ? (
                <InlineTextEditor
                  value={cardData.groomName || 'Groom\'s Name'}
                  onChange={(value) => handleTextChange('groomName', value)}
                  onComplete={() => setEditingElement(null)}
                  className="text-center font-bold w-full"
                  style={{ 
                    color: getTextColor('groomName'),
                    fontFamily: getFontFamily('heading'),
                    fontSize: 'inherit'
                  }}
                />
              ) : (
                <h1 
                  className={`font-bold leading-tight text-center transition-all duration-200 cursor-pointer ${
                    selectedElement === 'groomName' ? 'drop-shadow-lg' : 'drop-shadow-sm'
                  }`}
                  onDoubleClick={() => handleDoubleClick('groomName')}
                  style={{ 
                    color: getTextColor('groomName'),
                    fontFamily: getFontFamily('heading'),
                    fontSize: `${elementFontSizes.groomName || 36}px`
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
              minWidth={150}
              maxWidth={400}
              minHeight={40}
              maxHeight={100}
              isSelected={selectedElement === 'weddingDate'}
              onSelect={handleElementSelect}
              customization={cardData.customization}
              rotation={elementRotations.weddingDate || 0}
              onRotate={handleElementRotate}
              onDragStart={() => handleDragStart('weddingDate')}
              onDragEnd={() => handleDragEnd('weddingDate')}
            >
              <div 
                className="flex items-center justify-center w-full h-full transition-all duration-200" 
                style={{ color: getTextColor('date') }}
                data-draggable-element="weddingDate"
              >
                <Calendar className="h-4 w-4 mr-2 opacity-70" />
                <span 
                  className="font-medium cursor-pointer"
                  onDoubleClick={() => handleDoubleClick('weddingDate')}
                  style={{ 
                    fontFamily: getFontFamily('date'),
                    fontSize: `${elementFontSizes.weddingDate || 14}px`
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
              minWidth={140}
              maxWidth={400}
              minHeight={40}
              maxHeight={100}
              isSelected={selectedElement === 'venue'}
              onSelect={handleElementSelect}
              customization={cardData.customization}
              rotation={elementRotations.venue || 0}
              onRotate={handleElementRotate}
              onDragStart={() => handleDragStart('venue')}
              onDragEnd={() => handleDragEnd('venue')}
            >
              <div 
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
                      color: getTextColor('venue'),
                      fontFamily: getFontFamily('venue')
                    }}
                  />
                ) : (
                  <div 
                    className="flex items-center justify-center transition-all duration-200 cursor-pointer" 
                    style={{ color: getTextColor('venue') }}
                    onDoubleClick={() => handleDoubleClick('venue')}
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
              minWidth={180}
              maxWidth={500}
              minHeight={60}
              maxHeight={150}
              isSelected={selectedElement === 'message'}
              onSelect={handleElementSelect}
              customization={cardData.customization}
              rotation={elementRotations.message || 0}
              onRotate={handleElementRotate}
              onDragStart={() => handleDragStart('message')}
              onDragEnd={() => handleDragEnd('message')}
            >
              <div 
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
                      color: getTextColor('message'),
                      fontFamily: getFontFamily('message')
                    }}
                  />
                ) : (
                  <p 
                    className="text-center italic leading-relaxed max-w-xs transition-all duration-200 cursor-pointer"
                    style={{ 
                      color: getTextColor('message'),
                      fontFamily: getFontFamily('message'),
                      fontSize: `${elementFontSizes.message || 16}px`
                    }}
                    onDoubleClick={() => handleDoubleClick('message')}
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

export default EnhancedCardEditor;