
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TemplateSelector from '@/components/TemplateSelector';
import CustomizationForm from '@/components/CustomizationForm';
import CardPreview from '@/components/CardPreview';
import DownloadSection from '@/components/DownloadSection';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { toast } from 'sonner';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const templateParam = searchParams.get('template');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  
  const [currentStep, setCurrentStep] = useState<'hero'>('hero');
  const [cardData, setCardData] = useState<WeddingCardData>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    message: '',
    templateId: '',
    uploadedImage: ''
  });

  // Redirect to customize page if editing
  useEffect(() => {
    if (editId) {
      navigate(`/customize?edit=${editId}`);
    }
  }, [editId, navigate]);

  // Redirect to customize page if template is selected
  useEffect(() => {
    if (templateParam) {
      navigate(`/customize?template=${templateParam}`);
    }
  }, [templateParam, navigate]);

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/customize?template=${templateId}`);
  };

  const handleDataChange = (newData: Partial<WeddingCardData>) => {
    setCardData(prev => ({ ...prev, ...newData }));
  };

  const startCreating = () => {
    navigate('/templates');
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
          <div className="text-center pb-8">
            <button
              onClick={startCreating}
              className="wedding-gradient text-white px-8 py-4 rounded-lg text-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started Now
            </button>
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
