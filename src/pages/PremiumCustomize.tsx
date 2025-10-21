import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, EyeOff, Grid3x3, Layers, Download } from 'lucide-react';
import Header from '@/components/Header';
import { PremiumCardPreview } from '@/components/PremiumCardPreview';
import PremiumCustomizationForm from '@/components/PremiumCustomizationForm';
import DownloadSection from '@/components/DownloadSection';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { templates } from '@/data/templates';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PremiumCustomize = () => {
  const { templateId } = useParams<{ templateId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const legacyTemplateParam = searchParams.get('template');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  const isMobile = useIsMobile();

  const currentTemplateId = templateId || legacyTemplateParam || '';

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
    showGrid: false,
    showGuides: true,
    isPreviewMode: false
  });

  const selectedTemplate = templates.find(t => t.id === currentTemplateId);

  useEffect(() => {
    if (editId && user) {
      loadCard(editId).then((card) => {
        if (card) setCardData(card);
      });
    }
  }, [editId, user, loadCard]);

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

  if (!currentTemplateId || !selectedTemplate) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-3xl font-premium-serif">Template Not Found</h1>
            <p className="text-muted-foreground">Please select a template to continue.</p>
            <Button onClick={() => navigate('/templates')} className="wedding-gradient">
              Browse Templates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      
      {/* Top Toolbar - Sticky */}
      <div className="border-b bg-card/50 backdrop-blur-sm z-50 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/templates')}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-premium-serif font-semibold truncate">
                  {selectedTemplate.name}
                </h1>
                <p className="text-xs text-muted-foreground">
                  #{currentTemplateId.slice(-5).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Design Tools - Desktop Only */}
              <TooltipProvider>
                <div className="hidden lg:flex items-center gap-1 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={designState.showGrid ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setDesignState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle Grid</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={designState.showGuides ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setDesignState(prev => ({ ...prev, showGuides: !prev.showGuides }))}
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle Guides</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={designState.isPreviewMode ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setDesignState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}
                      >
                        {designState.isPreviewMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle Preview Mode</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              {user && (
                <Button
                  onClick={handleSaveCard}
                  disabled={saving}
                  size="sm"
                  className="wedding-gradient"
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {isMobile ? (
          /* ========== Mobile Layout ========== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Card Preview Area */}
            <div className="flex-1 overflow-auto min-h-0">
              <div className="h-full flex items-center justify-center p-4">
                <PremiumCardPreview
                  cardData={cardData}
                  onDataChange={handleDataChange}
                  isPreviewMode={designState.isPreviewMode}
                  showGrid={designState.showGrid}
                  showGuides={designState.showGuides}
                />
              </div>
            </div>

            {/* Mobile Bottom Drawer */}
            <div className="border-t bg-card shadow-[0_-4px_12px_rgba(0,0,0,0.1)] max-h-[50vh] overflow-y-auto shrink-0">
              <div className="p-4 space-y-4">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant={designState.isPreviewMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDesignState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}
                    className="flex-1"
                  >
                    {designState.isPreviewMode ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                    {designState.isPreviewMode ? 'Preview' : 'Design'}
                  </Button>
                  <Button
                    variant={designState.showGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDesignState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Customization Form */}
                <PremiumCustomizationForm
                  cardData={cardData}
                  onDataChange={handleDataChange}
                />

                {/* Download Section */}
                <DownloadSection cardId="card-preview" cardData={cardData} />
              </div>
            </div>
          </div>
        ) : (
          /* ========== Desktop Layout ========== */
          <>
            {/* Left Sidebar - Customization */}
            <aside className="w-80 border-r bg-card/30 overflow-y-auto shrink-0">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-premium-serif font-semibold mb-1">Customize</h2>
                  <p className="text-sm text-muted-foreground">
                    Edit your card details
                  </p>
                </div>

                <PremiumCustomizationForm
                  cardData={cardData}
                  onDataChange={handleDataChange}
                />
              </div>
            </aside>

            {/* Center - Card Preview */}
            <main className="flex-1 overflow-auto min-w-0 bg-muted/20">
              <div className="h-full w-full flex items-center justify-center p-8">
                <div className="w-full max-w-4xl">
                  <PremiumCardPreview
                    cardData={cardData}
                    onDataChange={handleDataChange}
                    isPreviewMode={designState.isPreviewMode}
                    showGrid={designState.showGrid}
                    showGuides={designState.showGuides}
                  />
                </div>
              </div>
            </main>

            {/* Right Sidebar - Export Actions */}
            <aside className="w-80 border-l bg-card/30 overflow-y-auto shrink-0">
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-premium-serif font-semibold mb-1">Export</h2>
                  <p className="text-sm text-muted-foreground">
                    Download your card
                  </p>
                </div>

                <DownloadSection cardId="card-preview" cardData={cardData} />

                {designState.isPreviewMode && (
                  <div className="mt-6">
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      <Eye className="h-3 w-3 mr-2" />
                      Preview Mode Active
                    </Badge>
                  </div>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default PremiumCustomize;