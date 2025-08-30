
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Loader2, Settings } from 'lucide-react';
import Header from '@/components/Header';
import PremiumCustomizationForm from '@/components/PremiumCustomizationForm';
import EnhancedCardEditor from '@/components/EnhancedCardEditor';
import DownloadSection from '@/components/DownloadSection';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const Customize = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const templateParam = searchParams.get('template');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  const isMobile = useIsMobile();
  
  const [cardData, setCardData] = useState<WeddingCardData>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    message: '',
    templateId: templateParam || '',
    uploadedImage: ''
  });

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

    // Set default names if empty
    const cardToSave = {
      ...cardData,
      brideName: cardData.brideName || 'Bride',
      groomName: cardData.groomName || 'Groom'
    };

    await saveCard(cardToSave);
  };

  if (!cardData.templateId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold mb-4">No Template Selected</h1>
          <p className="text-muted-foreground mb-6">Please select a template first.</p>
          <Button onClick={() => navigate('/templates')}>
            Choose Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="mb-6 md:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/templates')}
            className="mb-4"
            size={isMobile ? "sm" : "default"}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>

        {isMobile ? (
          /* Mobile Layout with Sheet for Controls */
          <div className="space-y-6">
            {/* Save Button */}
            {user && cardData.templateId && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveCard}
                  disabled={saving}
                  className="wedding-gradient text-white"
                  size="sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editId ? 'Update' : 'Save'
                  )}
                </Button>
              </div>
            )}
            
            {/* Mobile Card Editor */}
            <div className="space-y-4">
              <EnhancedCardEditor cardData={cardData} onDataChange={handleDataChange} />
              
              {/* Edit Details Button */}
              <div className="flex justify-center">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] flex flex-col">
                    <SheetHeader className="flex-shrink-0">
                      <SheetTitle></SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto mt-6">
                      <PremiumCustomizationForm
                        cardData={cardData}
                        onDataChange={handleDataChange}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Download Section */}
              {cardData.templateId && (
                <DownloadSection cardId="card-preview" cardData={cardData} />
              )}
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Customization Form */}
            <div className="lg:col-span-1 space-y-6">
              <PremiumCustomizationForm
                cardData={cardData}
                onDataChange={handleDataChange}
              />
            </div>
            
            {/* Right Panel - Enhanced Live Editor */}
            <div className="lg:col-span-2 space-y-6">
              <EnhancedCardEditor cardData={cardData} onDataChange={handleDataChange} />
              
              {/* Action Buttons - Always show if user is logged in and template is selected */}
              <div className="space-y-4">
                {user && cardData.templateId && (
                  <Button
                    onClick={handleSaveCard}
                    disabled={saving}
                    className="wedding-gradient text-white w-full h-12"
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editId ? 'Update Card' : 'Save Card'
                    )}
                  </Button>
                )}
                
                {/* Download Section - Always show if template is selected */}
                {cardData.templateId && (
                  <DownloadSection cardId="card-preview" cardData={cardData} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customize;
