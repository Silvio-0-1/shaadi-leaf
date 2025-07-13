
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplateSelector from '@/components/TemplateSelector';
import CustomizationForm from '@/components/CustomizationForm';
import CardPreview from '@/components/CardPreview';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { toast } from 'sonner';

const Index = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  
  const [currentStep, setCurrentStep] = useState<'hero' | 'template' | 'customize'>('hero');
  const [cardData, setCardData] = useState<WeddingCardData>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    message: '',
    templateId: '',
    uploadedImage: ''
  });

  // Load card for editing if editId is provided
  useEffect(() => {
    if (editId && user) {
      loadCard(editId).then((card) => {
        if (card) {
          setCardData(card);
          setCurrentStep('customize');
        }
      });
    }
  }, [editId, user, loadCard]);

  const handleTemplateSelect = (templateId: string) => {
    setCardData(prev => ({ ...prev, templateId }));
    setCurrentStep('customize');
  };

  const handleDataChange = (newData: Partial<WeddingCardData>) => {
    setCardData(prev => ({ ...prev, ...newData }));
  };

  const startCreating = () => {
    setCurrentStep('template');
  };

  const handleSaveCard = async () => {
    if (!user) {
      toast.error('Please sign in to save your wedding card');
      return;
    }

    if (!cardData.brideName || !cardData.groomName || !cardData.templateId) {
      toast.error('Please fill in the bride and groom names');
      return;
    }

    await saveCard(cardData);
  };

  const hasRequiredData = cardData.brideName && cardData.groomName && cardData.templateId;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {currentStep === 'hero' && (
        <div>
          <HeroSection />
          <div className="text-center pb-12">
            <button
              onClick={startCreating}
              className="wedding-gradient text-white px-8 py-4 rounded-lg text-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started Now
            </button>
          </div>
        </div>
      )}

      {currentStep === 'template' && (
        <div className="container mx-auto px-4 py-12">
          <TemplateSelector
            selectedTemplate={cardData.templateId}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>
      )}

      {currentStep === 'customize' && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <CustomizationForm
                cardData={cardData}
                onDataChange={handleDataChange}
              />
              
              {/* Save Card Button - Only show if user is logged in */}
              {user && hasRequiredData && (
                <div className="text-center">
                  <Button
                    onClick={handleSaveCard}
                    disabled={saving}
                    className="wedding-gradient text-white w-full"
                    size="lg"
                  >
                    {saving ? 'Saving...' : (editId ? 'Update Card' : 'Save Card')}
                  </Button>
                </div>
              )}
              
              {/* Back to Templates Button */}
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('template')}
                  className="text-primary hover:text-primary/80 font-medium underline underline-offset-4"
                >
                  ← Change Template
                </button>
              </div>
            </div>
            
            <div>
              <CardPreview cardData={cardData} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-muted/30 py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 text-primary mr-2" fill="currentColor" />
            <span className="font-serif text-xl font-semibold">Digital Wedding Cards</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Creating beautiful moments, one card at a time
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for couples everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
