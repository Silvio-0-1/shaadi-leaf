import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Crown,
  Settings,
  BarChart3,
  Coins,
  Users,
  FileText
} from 'lucide-react';
import Header from '@/components/Header';
import VisualTemplateBuilder from '@/components/VisualTemplateBuilder';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminCredits } from '@/hooks/useAdminCredits';
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
  const { usersWithCredits, isLoading: creditsLoading, addCredits, deductCredits, isManaging } = useAdminCredits();
  const [activeTab, setActiveTab] = useState<'templates' | 'create' | 'analytics' | 'credits'>('templates');
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');

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

  const handleCreditAction = async (action: 'add' | 'deduct') => {
    if (!selectedUser || !creditAmount || !creditDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      if (action === 'add') {
        await addCredits(selectedUser.id, amount, creditDescription);
      } else {
        await deductCredits(selectedUser.id, amount, creditDescription);
      }
      setShowCreditDialog(false);
      setCreditAmount('');
      setCreditDescription('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Credit action failed:', error);
    }
  };

  const openCreditDialog = (user: any) => {
    setSelectedUser(user);
    setShowCreditDialog(true);
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
              Manage templates, users, and system performance
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTemplates.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersWithCredits?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usersWithCredits?.reduce((sum, user) => sum + user.balance, 0) || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
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
            variant={activeTab === 'credits' ? 'default' : 'outline'}
            onClick={() => setActiveTab('credits')}
          >
            <Coins className="h-4 w-4 mr-2" />
            Credit Management
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

        {/* Credit Management */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">User Credit Management</h2>
              <div className="text-sm text-muted-foreground">
                Total Credits in System: {usersWithCredits?.reduce((sum, user) => sum + user.balance, 0) || 0}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {creditsLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : (
                    usersWithCredits?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{user.full_name || 'No Name'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{user.balance} Credits</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openCreditDialog(user)}
                          disabled={isManaging}
                        >
                          Manage Credits
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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

        {/* Credit Management Dialog */}
        <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Credits for {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>Current Balance: {selectedUser?.balance} Credits</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credit-amount">Amount</Label>
                <Input
                  id="credit-amount"
                  type="number"
                  placeholder="Enter credit amount"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="credit-description">Description</Label>
                <Input
                  id="credit-description"
                  placeholder="Reason for credit change"
                  value={creditDescription}
                  onChange={(e) => setCreditDescription(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleCreditAction('add')}
                  disabled={isManaging}
                  className="flex-1"
                >
                  Add Credits
                </Button>
                <Button 
                  onClick={() => handleCreditAction('deduct')}
                  disabled={isManaging}
                  variant="outline"
                  className="flex-1"
                >
                  Deduct Credits
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;