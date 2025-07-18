import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Crown,
  Settings,
  BarChart3
} from 'lucide-react';
import Header from '@/components/Header';
import VisualTemplateBuilder from '@/components/VisualTemplateBuilder';
import { useUserRole } from '@/hooks/useUserRole';
import { Template } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { templates } from '@/data/templates';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState<'templates' | 'create' | 'analytics'>('templates');
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }
    
    if (isAdmin) {
      fetchCustomTemplates();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchCustomTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom templates:', error);
        toast.error('Failed to fetch templates');
      } else {
        const formattedTemplates: Template[] = data.map(template => ({
          id: template.id,
          name: template.name,
          category: 'custom' as const,
          thumbnail: template.background_image || '/placeholder.svg',
          isPremium: template.is_premium,
          colors: template.colors as any,
          fonts: template.fonts as any,
          layouts: ['custom'],
          supportsMultiPhoto: true,
          supportsVideo: false,
          backgroundImage: template.background_image,
          defaultPositions: template.default_positions as any
        }));
        setCustomTemplates(formattedTemplates);
      }
    } catch (error) {
      console.error('Error fetching custom templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete template');
      } else {
        toast.success('Template deleted successfully');
        fetchCustomTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleTemplateCreated = (template: Template) => {
    setActiveTab('templates');
    fetchCustomTemplates();
    toast.success('Template created successfully');
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const allTemplates = [...templates, ...customTemplates];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-serif font-semibold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage templates and monitor system performance
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'templates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('templates')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Template Management
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Template Management */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">All Templates</h2>
              <div className="text-sm text-muted-foreground">
                Total: {allTemplates.length} templates
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allTemplates.map((template) => (
                <Card key={template.id} className="relative group">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                    <img 
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Premium Badge */}
                    {template.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-gold-500 text-white">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/customize?template=${template.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {template.category === 'custom' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              // Edit functionality can be added later
                              toast.info('Edit functionality coming soon');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">
                      {template.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground capitalize">
                        {template.category}
                      </p>
                      {template.category === 'custom' && (
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Create Template */}
        {activeTab === 'create' && (
          <VisualTemplateBuilder onTemplateCreated={handleTemplateCreated} />
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">System Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Templates</p>
                    <p className="text-2xl font-semibold">{allTemplates.length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Custom Templates</p>
                    <p className="text-2xl font-semibold">{customTemplates.length}</p>
                  </div>
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Built-in Templates</p>
                    <p className="text-2xl font-semibold">{templates.length}</p>
                  </div>
                  <Crown className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
            </div>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <p className="text-muted-foreground">
                Analytics features will be expanded in future updates.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;