
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Eye, Type, Palette, Move, RotateCw, Maximize2, Tags, X } from 'lucide-react';
import { Template, CardElements, ElementPosition } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AuthRequiredModal from './AuthRequiredModal';
import DraggableElement from '@/components/DraggableElement';

interface VisualTemplateBuilderProps {
  onTemplateCreated: (template: Template) => void;
}

interface ElementConfig {
  id: keyof CardElements;
  label: string;
  icon: React.ReactNode;
  defaultSize: { width: number; height: number };
  type: 'text' | 'image';
}

const ELEMENT_CONFIGS: ElementConfig[] = [
  { id: 'brideName', label: 'Bride Name', icon: '👰', defaultSize: { width: 200, height: 40 }, type: 'text' },
  { id: 'groomName', label: 'Groom Name', icon: '🤵', defaultSize: { width: 200, height: 40 }, type: 'text' },
  { id: 'weddingDate', label: 'Wedding Date', icon: '📅', defaultSize: { width: 180, height: 30 }, type: 'text' },
  { id: 'venue', label: 'Venue', icon: '🏛️', defaultSize: { width: 220, height: 30 }, type: 'text' },
  { id: 'message', label: 'Custom Message', icon: '💌', defaultSize: { width: 300, height: 60 }, type: 'text' },
  { id: 'photo', label: 'Couple Photo', icon: '📸', defaultSize: { width: 150, height: 200 }, type: 'image' },
  { id: 'logo', label: 'Logo/Monogram', icon: '🏷️', defaultSize: { width: 80, height: 80 }, type: 'image' },
  { id: 'heartIcon', label: 'Heart Decoration', icon: '💖', defaultSize: { width: 30, height: 30 }, type: 'text' },
];

const VisualTemplateBuilder = ({ onTemplateCreated }: VisualTemplateBuilderProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [templateData, setTemplateData] = useState({
    name: '',
    backgroundImage: '',
    primaryColor: '#8b5cf6',
    secondaryColor: '#faf5ff',
    accentColor: '#a78bfa',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
  });

  const [elementPositions, setElementPositions] = useState<CardElements>({
    brideName: { x: 0, y: -60 },
    groomName: { x: 0, y: -20 },
    heartIcon: { x: 0, y: 20 },
    weddingDate: { x: 0, y: 60 },
    venue: { x: 0, y: 100 },
    message: { x: 0, y: 140 },
    photo: { 
      position: { x: 0, y: -140 },
      size: { width: 150, height: 200 }
    },
    logo: { x: 0, y: -200 },
  });

  const [selectedElement, setSelectedElement] = useState<keyof CardElements | null>(null);
  const [placedElements, setPlacedElements] = useState<Set<keyof CardElements>>(new Set());
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from('template_tags')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching tags:', error);
      } else {
        setAvailableTags(data || []);
      }
    };
    
    fetchTags();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTemplateData(prev => ({ ...prev, backgroundImage: result }));
        toast.success('Background image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleElementMove = useCallback((elementId: keyof CardElements, newPosition: ElementPosition) => {
    setElementPositions(prev => ({
      ...prev,
      [elementId]: elementId === 'photo' 
        ? { ...prev.photo, position: newPosition }
        : newPosition 
    }));
  }, []);

  const handleAddElement = (elementId: keyof CardElements) => {
    setPlacedElements(prev => new Set(prev).add(elementId));
    setSelectedElement(elementId);
  };

  const handleRemoveElement = (elementId: keyof CardElements) => {
    setPlacedElements(prev => {
      const newSet = new Set(prev);
      newSet.delete(elementId);
      return newSet;
    });
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const handleAddTag = (tagId: string) => {
    const tag = availableTags.find(t => t.id === tagId);
    if (tag && !selectedTags.includes(tag.name)) {
      setSelectedTags(prev => [...prev, tag.name]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagName));
  };

  const renderElementContent = (config: ElementConfig) => {
    const isText = config.type === 'text';
    const style = {
      color: templateData.primaryColor,
      fontFamily: isText ? templateData.headingFont : undefined,
      fontSize: config.id === 'brideName' || config.id === 'groomName' ? '18px' : '14px',
      fontWeight: config.id === 'brideName' || config.id === 'groomName' ? 'bold' : 'normal',
    };

    if (config.type === 'image') {
      return (
        <div 
          className="border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center bg-background/80"
          style={{ 
            width: config.defaultSize.width, 
            height: config.defaultSize.height,
            minWidth: config.defaultSize.width,
            minHeight: config.defaultSize.height
          }}
        >
          <div className="text-center p-2">
            <div className="text-2xl mb-1">{config.icon}</div>
            <div className="text-xs text-muted-foreground">{config.label}</div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="bg-background/80 px-3 py-2 rounded shadow-sm border"
        style={style}
      >
        <span className="mr-2">{config.icon}</span>
        {config.label}
      </div>
    );
  };

  const handleCreateTemplate = async () => {
    if (!templateData.name) {
      toast.error('Please enter a template name');
      return;
    }

    if (!templateData.backgroundImage) {
      toast.error('Please upload a background image');
      return;
    }
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .insert({
          name: templateData.name,
          category: 'custom',
          background_image: templateData.backgroundImage,
          created_by: user.id,
          colors: {
            primary: templateData.primaryColor,
            secondary: templateData.secondaryColor,
            accent: templateData.accentColor
          } as any,
          fonts: {
            heading: templateData.headingFont,
            body: templateData.bodyFont
          } as any,
          default_positions: elementPositions as any,
          tags: selectedTags,
          is_premium: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        toast.error('Failed to create template. Please try again.');
        return;
      }

      const newTemplate: Template = {
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
        defaultPositions: data.default_positions as any
      };

      onTemplateCreated(newTemplate);
      toast.success('Custom template created successfully!');
      
      // Reset form
      setTemplateData({
        name: '',
        backgroundImage: '',
        primaryColor: '#8b5cf6',
        secondaryColor: '#faf5ff',
        accentColor: '#a78bfa',
        headingFont: 'Playfair Display',
        bodyFont: 'Inter',
      });
      setPlacedElements(new Set());
      setSelectedElement(null);
      setSelectedTags([]);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template. Please try again.');
    }
  };

  const fontOptions = [
    'Playfair Display', 'Dancing Script', 'Cormorant Garamond', 'Merriweather',
    'Montserrat', 'Poppins', 'Inter', 'Work Sans'
  ];

  return (
    <div className="flex gap-6 h-[800px]">
      {/* Left Panel - Controls */}
      <Card className="w-80 p-4 space-y-4 overflow-y-auto">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
            Visual Template Builder
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop elements to create your custom template
          </p>
        </div>

        <Separator />

        {/* Template Name */}
        <div className="space-y-2">
          <Label htmlFor="templateName">Template Name</Label>
          <Input
            id="templateName"
            placeholder="Enter template name"
            value={templateData.name}
            onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {/* Background Upload */}
        <div className="space-y-2">
          <Label>Background Image</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Background</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <Separator />

        {/* Element Palette */}
        <div className="space-y-2">
          <Label>Add Elements</Label>
          <div className="grid grid-cols-1 gap-2">
            {ELEMENT_CONFIGS.map((config) => (
              <Button
                key={config.id}
                variant={placedElements.has(config.id) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (placedElements.has(config.id)) {
                    handleRemoveElement(config.id);
                  } else {
                    handleAddElement(config.id);
                  }
                }}
                className="justify-start"
              >
                <span className="mr-2">{config.icon}</span>
                {config.label}
                {placedElements.has(config.id) && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Style Controls */}
        <div className="space-y-4">
          <Label className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={templateData.primaryColor}
                onChange={(e) => setTemplateData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-8 p-1"
              />
              <Label className="text-xs">Primary</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={templateData.secondaryColor}
                onChange={(e) => setTemplateData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-12 h-8 p-1"
              />
              <Label className="text-xs">Secondary</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center">
            <Type className="h-4 w-4 mr-2" />
            Fonts
          </Label>
          <Select 
            value={templateData.headingFont} 
            onValueChange={(value) => setTemplateData(prev => ({ ...prev, headingFont: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Tags Selection */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Tags className="h-4 w-4 mr-2" />
            Template Tags
          </Label>
          <div className="space-y-2">
            <Select onValueChange={handleAddTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags..." />
              </SelectTrigger>
              <SelectContent>
                {availableTags
                  .filter(tag => !selectedTags.includes(tag.name))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagName) => {
                const tag = availableTags.find(t => t.name === tagName);
                return (
                  <Badge 
                    key={tagName} 
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    {tag && (
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    <span>{tagName}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveTag(tagName)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <Separator />

        <Button 
          onClick={handleCreateTemplate}
          className="w-full"
          size="lg"
          disabled={!templateData.name || !templateData.backgroundImage}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>

        <AuthRequiredModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          action="create templates"
        />
      </Card>

      {/* Right Panel - Canvas */}
      <Card className="flex-1 p-4">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Design Canvas</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Move className="h-4 w-4" />
              <span>Drag elements to position them</span>
            </div>
          </div>
          
          <div 
            ref={canvasRef}
            className="flex-1 relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted/50"
            style={{
              backgroundImage: templateData.backgroundImage ? `url(${templateData.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Grid Lines Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #ccc 1px, transparent 1px),
                  linear-gradient(to bottom, #ccc 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {!templateData.backgroundImage && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Upload a background image to start designing</p>
                </div>
              </div>
            )}

            {/* Render placed elements */}
            {Array.from(placedElements).map((elementId) => {
              const config = ELEMENT_CONFIGS.find(c => c.id === elementId);
              if (!config) return null;

              const position = elementId === 'photo' 
                ? elementPositions[elementId].position
                : elementPositions[elementId] as ElementPosition;

              return (
                <DraggableElement
                  key={elementId}
                  id={elementId}
                  position={position}
                  onMove={(position) => handleElementMove(elementId, position)}
                  containerRef={canvasRef}
                >
                  {renderElementContent(config)}
                </DraggableElement>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VisualTemplateBuilder;
