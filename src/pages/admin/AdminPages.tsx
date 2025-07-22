import { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const AdminPages = () => {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pages</h1>
            <p className="text-muted-foreground">Manage website pages and content</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Page
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Page management interface will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};