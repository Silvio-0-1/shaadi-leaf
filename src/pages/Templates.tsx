import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import TemplateSelector from '@/components/TemplateSelector';

const Templates = () => {
  const navigate = useNavigate();

  const handleTemplateSelect = (templateId: string) => {
    // Navigate to home with the selected template
    navigate(`/?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <TemplateSelector
          selectedTemplate=""
          onTemplateSelect={handleTemplateSelect}
        />
      </div>
    </div>
  );
};

export default Templates;