import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Download, Settings, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import { PremiumDesignToolbar } from '@/components/PremiumDesignToolbar';
import { MobileCustomizationDrawer } from '@/components/MobileCustomizationDrawer';
import { PremiumCardPreview } from '@/components/PremiumCardPreview';
import PremiumCustomizationForm from '@/components/PremiumCustomizationForm';
import DownloadSection from '@/components/DownloadSection';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { templates } from '@/data/templates';
import { toast } from 'sonner';

const PremiumCustomize = () => {
  const { templateId } = useParams<{ templateId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const legacyTemplateParam = searchParams.get('template');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  const isMobile = useIsMobile();

  // Use templateId from URL, fallback to legacy template param
  const currentTemplateId = templateId || legacyTemplateParam || '';

  // State management
  const [cardData, setCardData] = useState<WeddingCardData>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    message: '',
    templateId: currentTemplateId,
    uploadedImage: ''
  });

  const [designState, setDesignState] = useState({
    selectedElement: null as string | null,
    isElementLocked: false,
    canUndo: false,
    canRedo: false,
    showGrid: false,
    showGuides: true,
    isPreviewMode: false
  });

  // Template validation
  const selectedTemplate = templates.find(t => t.id === currentTemplateId);

  // Load card for editing if editId is provided
  useEffect(() => {
    if (editId && user) {
      loadCard(editId).then((card) => {
        if (card) {
          setCardData(card);
        }
      });
    }
  }, [editId, user, loadCard]);

  // Update URL when template changes
  useEffect(() => {
    if (currentTemplateId && currentTemplateId !== templateId) {
      const newUrl = `/customize/${currentTemplateId}`;
      const params = new URLSearchParams();
      if (editId) params.set('edit', editId);
      const fullUrl = params.toString() ? `${newUrl}?${params.toString()}` : newUrl;
      navigate(fullUrl, { replace: true });
    }
  }, [currentTemplateId, templateId, editId, navigate]);

  const handleDataChange = (newData: Partial<WeddingCardData>) => {
    setCardData(prev => ({ ...prev, ...newData }));
  };

  const handleSaveCard = async () => {
    if (!user) {
      toast.error('Please sign in to save your wedding card');
      return;
    }

    if (!cardData.templateId) {
      toast.error('Please select a template first');
      return;
    }

    const cardToSave = {
      ...cardData,
      brideName: cardData.brideName || 'Bride',
      groomName: cardData.groomName || 'Groom'
    };

    await saveCard(cardToSave);
  };

  const handleDesignAction = (action: string, payload?: any) => {
    switch (action) {
      case 'undo':
        setDesignState(prev => ({ ...prev, canUndo: false }));
        break;
      case 'redo':
        setDesignState(prev => ({ ...prev, canRedo: false }));
        break;
      case 'toggleGrid':
        setDesignState(prev => ({ ...prev, showGrid: !prev.showGrid }));
        break;
      case 'toggleGuides':
        setDesignState(prev => ({ ...prev, showGuides: !prev.showGuides }));
        break;
      case 'togglePreview':
        setDesignState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }));
        break;
      case 'duplicate':
        toast.success('Element duplicated');
        break;
      case 'delete':
        setDesignState(prev => ({ ...prev, selectedElement: null }));
        toast.success('Element deleted');
        break;
      case 'toggleLock':
        setDesignState(prev => ({ ...prev, isElementLocked: !prev.isElementLocked }));
        break;
      case 'reset':
        toast.success('Layout reset to default');
        break;
      case 'center':
        toast.success('Element centered');
        break;
    }
  };

  // No template selected
  if (!currentTemplateId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-background to-lavender-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center p-8 elegant-shadow">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-premium-serif font-semibold mb-2">No Template Selected</h1>
              <p className="text-muted-foreground">Please choose a beautiful template to start creating your wedding card.</p>
            </div>
            <Button onClick={() => navigate('/templates')} className="wedding-gradient text-white">
              Browse Templates
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Template not found
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-background to-lavender-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center p-8 elegant-shadow">
            <h1 className="text-2xl font-premium-serif font-semibold mb-4">Template Not Found</h1>
            <p className="text-muted-foreground mb-6">The template you're looking for doesn't exist or has been removed.</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/templates')} className="wedding-gradient text-white">
                Browse Templates
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-background to-lavender-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/templates')}
            className="mb-4 glassmorphism border-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-premium-serif font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Customize Your Card
              </h1>
              <p className="text-muted-foreground mt-1">
                {selectedTemplate.name} • Template #{currentTemplateId.slice(-5).toUpperCase()}
              </p>
            </div>
            
            {/* Desktop Save Button */}
            {!isMobile && user && cardData.templateId && (
              <Button
                onClick={handleSaveCard}
                disabled={saving}
                className="wedding-gradient text-white px-8"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : (editId ? 'Update Card' : 'Save Card')}
              </Button>
            )}
          </div>
        </div>

        {isMobile ? (
          /* Mobile Layout */
          <div className="space-y-4">
            {/* Mobile Card Preview */}
            <div className="h-[60vh]">
              <PremiumCardPreview
                cardData={cardData}
                onDataChange={handleDataChange}
                isPreviewMode={designState.isPreviewMode}
                showGrid={designState.showGrid}
                showGuides={designState.showGuides}
              />
            </div>

            {/* Mobile Design Toolbar */}
            <PremiumDesignToolbar
              selectedElement={designState.selectedElement}
              isElementLocked={designState.isElementLocked}
              canUndo={designState.canUndo}
              canRedo={designState.canRedo}
              showGrid={designState.showGrid}
              showGuides={designState.showGuides}
              isPreviewMode={designState.isPreviewMode}
              onUndo={() => handleDesignAction('undo')}
              onRedo={() => handleDesignAction('redo')}
              onToggleGrid={() => handleDesignAction('toggleGrid')}
              onToggleGuides={() => handleDesignAction('toggleGuides')}
              onTogglePreview={() => handleDesignAction('togglePreview')}
              onDuplicate={() => handleDesignAction('duplicate')}
              onDelete={() => handleDesignAction('delete')}
              onToggleLock={() => handleDesignAction('toggleLock')}
              onReset={() => handleDesignAction('reset')}
              onCenter={() => handleDesignAction('center')}
            />

            {/* Mobile Action Buttons */}
            <div className="flex gap-2">
              <MobileCustomizationDrawer cardData={cardData} onDataChange={handleDataChange}>
                <Button variant="outline" className="flex-1 glassmorphism border-0">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </MobileCustomizationDrawer>
              
              {user && (
                <Button
                  onClick={handleSaveCard}
                  disabled={saving}
                  className="wedding-gradient text-white px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>

            {/* Mobile Download Section */}
            <DownloadSection cardId="card-preview" cardData={cardData} />
          </div>
        ) : (
          /* Desktop Layout */
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Left Sidebar - Customization Panel */}
            <div className="col-span-3 space-y-6">
              <Card className="h-full glassmorphism border golden-border">
                <div className="p-6 h-full overflow-y-auto">
                  <div className="mb-6">
                    <h2 className="text-xl font-premium-serif font-semibold mb-2">Customization</h2>
                    <p className="text-sm text-muted-foreground">
                      Personalize every detail of your wedding card
                    </p>
                  </div>
                  
                  <Tabs defaultValue="basic" className="h-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="basic">Details</TabsTrigger>
                      <TabsTrigger value="design">Design</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-6">
                      <PremiumCustomizationForm
                        cardData={cardData}
                        onDataChange={handleDataChange}
                      />
                    </TabsContent>
                    
                    <TabsContent value="design" className="space-y-6">
                      <div className="text-center text-muted-foreground text-sm">
                        Advanced design controls coming soon...
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </div>

            {/* Center - Card Preview */}
            <div className="col-span-6 space-y-4">
              <PremiumDesignToolbar
                selectedElement={designState.selectedElement}
                isElementLocked={designState.isElementLocked}
                canUndo={designState.canUndo}
                canRedo={designState.canRedo}
                showGrid={designState.showGrid}
                showGuides={designState.showGuides}
                isPreviewMode={designState.isPreviewMode}
                onUndo={() => handleDesignAction('undo')}
                onRedo={() => handleDesignAction('redo')}
                onToggleGrid={() => handleDesignAction('toggleGrid')}
                onToggleGuides={() => handleDesignAction('toggleGuides')}
                onTogglePreview={() => handleDesignAction('togglePreview')}
                onDuplicate={() => handleDesignAction('duplicate')}
                onDelete={() => handleDesignAction('delete')}
                onToggleLock={() => handleDesignAction('toggleLock')}
                onReset={() => handleDesignAction('reset')}
                onCenter={() => handleDesignAction('center')}
              />
              
              <div className="h-[calc(100%-80px)]">
                <PremiumCardPreview
                  cardData={cardData}
                  onDataChange={handleDataChange}
                  isPreviewMode={designState.isPreviewMode}
                  showGrid={designState.showGrid}
                  showGuides={designState.showGuides}
                />
              </div>
            </div>

            {/* Right Sidebar - Actions & Download */}
            <div className="col-span-3 space-y-6">
              <Card className="glassmorphism border golden-border p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-premium-serif font-semibold mb-2">Actions</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Save your progress and download your card
                    </p>
                  </div>
                  
                  {user && cardData.templateId && (
                    <Button
                      onClick={handleSaveCard}
                      disabled={saving}
                      className="wedding-gradient text-white w-full"
                      size="lg"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : (editId ? 'Update Card' : 'Save Card')}
                    </Button>
                  )}
                  
                  <DownloadSection cardId="card-preview" cardData={cardData} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumCustomize;