import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Brush, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisualTemplateBuilder from '@/components/VisualTemplateBuilder';
import CustomTemplateCreator from '@/components/CustomTemplateCreator';
import { Template } from '@/types';

export const AdminTemplates = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

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

  const handleTemplateCreated = (template: Template) => {
    setIsCreateDialogOpen(false);
    // You can add logic here to refresh the templates list
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates</h1>
            <p className="text-muted-foreground">Manage all wedding card templates</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="visual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="visual" className="flex items-center space-x-2">
                    <Brush className="h-4 w-4" />
                    <span>Visual Builder</span>
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex items-center space-x-2">
                    <Code className="h-4 w-4" />
                    <span>Custom Creator</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="mt-4">
                  <VisualTemplateBuilder onTemplateCreated={handleTemplateCreated} />
                </TabsContent>
                <TabsContent value="custom" className="mt-4">
                  <CustomTemplateCreator onTemplateCreated={handleTemplateCreated} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Template management interface will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};