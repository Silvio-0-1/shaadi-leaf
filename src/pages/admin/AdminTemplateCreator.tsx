import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brush, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VisualTemplateBuilder from '@/components/VisualTemplateBuilder';
import CustomTemplateCreator from '@/components/CustomTemplateCreator';
import { Template } from '@/types';

export const AdminTemplateCreator = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

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
    // Navigate back to templates page after successful creation
    navigate('/admin/templates');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/templates')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Template</h1>
              <p className="text-muted-foreground">Design a custom wedding card template</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="visual" className="flex items-center space-x-2">
              <Brush className="h-4 w-4" />
              <span>Visual Builder</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Custom Creator</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="mt-6">
            <VisualTemplateBuilder onTemplateCreated={handleTemplateCreated} />
          </TabsContent>
          
          <TabsContent value="custom" className="mt-6">
            <CustomTemplateCreator onTemplateCreated={handleTemplateCreated} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};