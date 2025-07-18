import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Header from '@/components/Header';
import TemplateSelector from '@/components/TemplateSelector';
import CustomTemplateCreator from '@/components/CustomTemplateCreator';
import { useUserRole } from '@/hooks/useUserRole';
import { Template } from '@/types';

const Templates = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [showCreator, setShowCreator] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    // Navigate to home with the selected template
    navigate(`/?template=${templateId}`);
  };

  const handleTemplateCreated = (template: Template) => {
    // After template is created, switch back to selector and refresh
    setShowCreator(false);
    // Optionally, you could automatically select the new template
    handleTemplateSelect(template.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          {isAdmin && !roleLoading && (
            <div className="flex gap-2">
              <Button
                variant={showCreator ? "outline" : "default"}
                onClick={() => setShowCreator(!showCreator)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCreator ? "View Templates" : "Create Custom Template"}
              </Button>
            </div>
          )}
        </div>
        
        {showCreator ? (
          <CustomTemplateCreator onTemplateCreated={handleTemplateCreated} />
        ) : (
          <TemplateSelector
            selectedTemplate=""
            onTemplateSelect={handleTemplateSelect}
          />
        )}
      </div>
    </div>
  );
};

export default Templates;