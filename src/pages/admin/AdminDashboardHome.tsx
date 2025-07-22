
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { QuickActions } from '@/components/admin/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Star } from 'lucide-react';

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'template_created' | 'download' | 'credit_purchase';
  description: string;
  timestamp: string;
  user?: string;
}

interface PopularTemplate {
  id: string;
  name: string;
  category: string;
  downloads: number;
  thumbnail: string;
}

export const AdminDashboardHome = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTemplates: 0,
    creditsUsed: 0,
    totalDownloads: 0,
    userGrowth: '+12% from last month',
    templateGrowth: '+8% from last month',
    creditGrowth: '+25% from last month',
    downloadGrowth: '+18% from last month'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<PopularTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
      return;
    }
    
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch templates count (built-in + custom)
      const { count: customTemplatesCount } = await supabase
        .from('custom_templates')
        .select('*', { count: 'exact', head: true });

      // Fetch total credits used
      const { data: creditTransactions } = await supabase
        .from('credit_transactions')
        .select('amount')
        .lt('amount', 0);

      const creditsUsed = creditTransactions?.reduce((sum, transaction) => 
        sum + Math.abs(transaction.amount), 0) || 0;

      // Fetch wedding cards count as downloads
      const { count: downloadsCount } = await supabase
        .from('wedding_cards')
        .select('*', { count: 'exact', head: true });

      setStats(prev => ({
        ...prev,
        totalUsers: usersCount || 0,
        totalTemplates: (customTemplatesCount || 0) + 12, // 12 built-in templates
        creditsUsed,
        totalDownloads: downloadsCount || 0
      }));

      // Mock recent activity for now
      setRecentActivity([
        {
          id: '1',
          type: 'user_signup',
          description: 'New user registered',
          timestamp: '2 minutes ago',
          user: 'user@example.com'
        },
        {
          id: '2',
          type: 'template_created',
          description: 'Admin created new floral template',
          timestamp: '1 hour ago'
        },
        {
          id: '3',
          type: 'download',
          description: 'User downloaded Royal Gold template',
          timestamp: '3 hours ago',
          user: 'bride@example.com'
        }
      ]);

      // Mock popular templates
      setPopularTemplates([
        {
          id: 'royal-gold',
          name: 'Royal Gold',
          category: 'Classic',
          downloads: 234,
          thumbnail: '/placeholder.svg'
        },
        {
          id: 'floral-pink',
          name: 'Floral Pink',
          category: 'Floral',
          downloads: 189,
          thumbnail: '/placeholder.svg'
        },
        {
          id: 'modern-minimal',
          name: 'Modern Minimal',
          category: 'Modern',
          downloads: 156,
          thumbnail: '/placeholder.svg'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Overview */}
        <DashboardStats stats={stats} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.user && (
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Popular Templates</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/templates')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {popularTemplates.map((template) => (
                <div key={template.id} className="relative group">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-3">
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{template.category}</span>
                      <span>{template.downloads} downloads</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
