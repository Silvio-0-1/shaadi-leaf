
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import CustomizationForm from '@/components/CustomizationForm';
import CardPreview from '@/components/CardPreview';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { toast } from 'sonner';

const Customize = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const templateParam = searchParams.get('template');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  
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

    if (!cardData.brideName || !cardData.groomName || !cardData.templateId) {
      toast.error('Please fill in the bride and groom names');
      return;
    }

    await saveCard(cardData);
  };

  const hasRequiredData = cardData.brideName && cardData.groomName && cardData.templateId;

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
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/templates')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editId ? 'Update Card' : 'Save Card'
                  )}
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <CardPreview cardData={cardData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customize;
