
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileImage, Coins, Download, TrendingUp, Star } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ title, value, icon: Icon, change, changeType = 'neutral' }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className={`text-xs ${
          changeType === 'positive' ? 'text-green-600' : 
          changeType === 'negative' ? 'text-red-600' : 
          'text-muted-foreground'
        }`}>
          {change}
        </p>
      )}
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalTemplates: number; 
    creditsUsed: number;
    totalDownloads: number;
    userGrowth: string;
    templateGrowth: string;
    creditGrowth: string;
    downloadGrowth: string;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        icon={Users}
        change={stats.userGrowth}
        changeType="positive"
      />
      <StatCard
        title="Templates"
        value={stats.totalTemplates}
        icon={FileImage}
        change={stats.templateGrowth}
        changeType="positive"
      />
      <StatCard
        title="Credits Used"
        value={stats.creditsUsed.toLocaleString()}
        icon={Coins}
        change={stats.creditGrowth}
        changeType="positive"
      />
      <StatCard
        title="Downloads"
        value={stats.totalDownloads.toLocaleString()}
        icon={Download}
        change={stats.downloadGrowth}
        changeType="positive"
      />
    </div>
  );
};
