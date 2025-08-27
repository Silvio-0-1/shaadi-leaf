import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { templates } from '@/data/templates';
import { Template } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminTemplates = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCustomTemplates();
    }
  }, [isAdmin]);

  const fetchCustomTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching custom templates:', error);
        toast.error('Failed to load custom templates');
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
          defaultPositions: template.default_positions as any,
          tags: template.tags || []
        }));
        setCustomTemplates(formattedTemplates);
      }
    } catch (error) {
      console.error('Error fetching custom templates:', error);
      toast.error('Failed to load custom templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

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

  const handleEditTemplate = (templateId: string) => {
    // Navigate to edit page (to be implemented)
    navigate(`/admin/templates/edit/${templateId}`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    navigate(`/customize?template=${templateId}`);
  };

  // Combine static and custom templates
  const allTemplates = [...templates, ...customTemplates];
  const filteredTemplates = allTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates</h1>
            <p className="text-muted-foreground">Manage all wedding card templates</p>
          </div>
          <Button onClick={() => navigate('/admin/templates/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Templates ({filteredTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Preview</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-12 h-16 object-cover rounded border"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.category === 'custom' ? (
                          <Badge variant="secondary">Custom</Badge>
                        ) : (
                          <Badge variant="default">Built-in</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {template.isPremium ? (
                          <Badge className="bg-gold-500 text-white">Premium</Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewTemplate(template.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {template.category === 'custom' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTemplate(template.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No templates found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};