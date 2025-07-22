
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Coins, BarChart3, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create Template',
      description: 'Add a new wedding card template',
      icon: Plus,
      action: () => navigate('/admin/templates/create'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Users',
      description: 'Manage user accounts',
      icon: Users,
      action: () => navigate('/admin/users'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Manage Credits',
      description: 'Handle credit transactions',
      icon: Coins,
      action: () => navigate('/admin/credits'),
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed reports',
      icon: BarChart3,
      action: () => navigate('/admin/analytics'),
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={action.action}
            >
              <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
