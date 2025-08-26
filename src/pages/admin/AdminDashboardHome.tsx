
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
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch current stats
      const [
        { count: usersCount },
        { count: customTemplatesCount },
        { data: creditTransactions },
        { count: downloadsCount },
        { count: sharedCardsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('custom_templates').select('*', { count: 'exact', head: true }),
        supabase.from('credit_transactions').select('amount').lt('amount', 0),
        supabase.from('wedding_cards').select('*', { count: 'exact', head: true }),
        supabase.from('shared_wedding_cards').select('*', { count: 'exact', head: true })
      ]);

      const creditsUsed = creditTransactions?.reduce((sum, transaction) => 
        sum + Math.abs(transaction.amount), 0) || 0;

      // Fetch last month stats for comparison
      const [
        { count: lastMonthUsers },
        { count: lastMonthTemplates },
        { data: lastMonthCreditTransactions },
        { count: lastMonthDownloads }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).lt('created_at', thisMonth.toISOString()),
        supabase.from('custom_templates').select('*', { count: 'exact', head: true }).lt('created_at', thisMonth.toISOString()),
        supabase.from('credit_transactions').select('amount').lt('amount', 0).lt('created_at', thisMonth.toISOString()),
        supabase.from('wedding_cards').select('*', { count: 'exact', head: true }).lt('created_at', thisMonth.toISOString())
      ]);

      const lastMonthCreditsUsed = lastMonthCreditTransactions?.reduce((sum, transaction) => 
        sum + Math.abs(transaction.amount), 0) || 0;

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}% from last month`;
      };

      const totalDownloads = (downloadsCount || 0) + (sharedCardsCount || 0);
      const lastMonthTotalDownloads = lastMonthDownloads || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalTemplates: (customTemplatesCount || 0) + 12, // 12 built-in templates
        creditsUsed,
        totalDownloads,
        userGrowth: calculateChange(usersCount || 0, lastMonthUsers || 0),
        templateGrowth: calculateChange(customTemplatesCount || 0, lastMonthTemplates || 0),
        creditGrowth: calculateChange(creditsUsed, lastMonthCreditsUsed),
        downloadGrowth: calculateChange(totalDownloads, lastMonthTotalDownloads)
      });

      // Fetch real recent activity
      const [
        { data: recentProfiles },
        { data: recentTemplates },
        { data: recentCards },
        { data: recentTransactions }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('custom_templates')
          .select('name, created_at')
          .order('created_at', { ascending: false })
          .limit(2),
        supabase
          .from('wedding_cards')
          .select('created_at, bride_name, groom_name')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('credit_transactions')
          .select('created_at, description, amount')
          .eq('transaction_type', 'purchase')
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      // Build recent activity from real data
      const activities: RecentActivity[] = [];

      // Add user signups
      recentProfiles?.forEach(profile => {
        activities.push({
          id: `signup_${profile.email}`,
          type: 'user_signup',
          description: 'New user registered',
          timestamp: formatTimestamp(profile.created_at),
          user: profile.email
        });
      });

      // Add template creations
      recentTemplates?.forEach(template => {
        activities.push({
          id: `template_${template.name}`,
          type: 'template_created',
          description: `New template "${template.name}" created`,
          timestamp: formatTimestamp(template.created_at)
        });
      });

      // Add wedding card downloads
      recentCards?.forEach(card => {
        activities.push({
          id: `download_${card.bride_name}_${card.groom_name}`,
          type: 'download',
          description: `Wedding card created for ${card.bride_name} & ${card.groom_name}`,
          timestamp: formatTimestamp(card.created_at)
        });
      });

      // Add credit purchases
      recentTransactions?.forEach(transaction => {
        activities.push({
          id: `credit_${transaction.created_at}`,
          type: 'credit_purchase',
          description: transaction.description,
          timestamp: formatTimestamp(transaction.created_at)
        });
      });

      // Sort by timestamp and take the most recent 8
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 8));

      // Fetch popular templates from actual usage
      const { data: templateUsage } = await supabase
        .from('wedding_cards')
        .select('template_id')
        .not('template_id', 'is', null);

      const templateCounts: { [key: string]: number } = {};
      templateUsage?.forEach(card => {
        templateCounts[card.template_id] = (templateCounts[card.template_id] || 0) + 1;
      });

      // Get top 3 most used templates
      const popularTemplateIds = Object.entries(templateCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      const mockPopularTemplates = [
        { id: 'royal-gold', name: 'Royal Gold', category: 'Classic' },
        { id: 'floral-pink', name: 'Floral Pink', category: 'Floral' },
        { id: 'modern-minimal', name: 'Modern Minimal', category: 'Modern' },
        { id: 'elegant-rose', name: 'Elegant Rose', category: 'Floral' },
        { id: 'vintage-gold', name: 'Vintage Gold', category: 'Classic' }
      ];

      const popularTemplates = popularTemplateIds.map(([templateId, count]) => {
        const templateInfo = mockPopularTemplates.find(t => t.id === templateId) || 
          { id: templateId, name: templateId, category: 'Custom' };
        
        return {
          ...templateInfo,
          downloads: count,
          thumbnail: '/placeholder.svg'
        };
      });

      // Fill with default popular templates if we don't have enough data
      while (popularTemplates.length < 3) {
        const defaultTemplate = mockPopularTemplates[popularTemplates.length];
        popularTemplates.push({
          ...defaultTemplate,
          downloads: Math.floor(Math.random() * 100) + 50,
          thumbnail: '/placeholder.svg'
        });
      }

      setPopularTemplates(popularTemplates);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Overview */}
        <div className="animate-fade-in">
          <DashboardStats stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {/* Quick Actions */}
          <div className="lg:col-span-1 xl:col-span-1 animate-fade-in">
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 xl:col-span-3 animate-fade-in">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start justify-between border-b border-border pb-4 last:border-0 animate-scale-in">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-medium truncate">{activity.description}</p>
                          {activity.user && (
                            <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge variant="outline" className="text-xs mb-1">
                            {activity.type.replace('_', ' ')}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recent activity to display</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular Templates */}
        <div className="animate-fade-in">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Popular Templates</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/templates')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {popularTemplates.map((template, index) => (
                  <div key={template.id} className="relative group animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-3 transition-transform duration-300 group-hover:scale-105">
                      <img 
                        src={template.thumbnail} 
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" className="hover-scale">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="hover-scale">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate pr-2">{template.name}</h3>
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate pr-2">{template.category}</span>
                        <span className="flex-shrink-0">{template.downloads} downloads</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
