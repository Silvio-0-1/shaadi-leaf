
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { UserCreditsManager } from '@/components/admin/UserCreditsManager';
import { TransactionHistory } from '@/components/admin/TransactionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Coins, TrendingUp, Users, History } from 'lucide-react';

interface CreditStats {
  totalUsers: number;
  totalCreditsDistributed: number;
  totalCreditsUsed: number;
  totalTransactions: number;
}

export const AdminCredits = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<CreditStats>({
    totalUsers: 0,
    totalCreditsDistributed: 0,
    totalCreditsUsed: 0,
    totalTransactions: 0
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total users with credits
      const { count: totalUsers } = await supabase
        .from('user_credits')
        .select('*', { count: 'exact', head: true });

      // Get total credits distributed (sum of all balances)
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('balance');

      const totalCreditsDistributed = creditsData?.reduce((sum, item) => sum + item.balance, 0) || 0;

      // Get total credits used (sum of all negative transactions)
      const { data: transactionsData } = await supabase
        .from('credit_transactions')
        .select('amount')
        .lt('amount', 0);

      const totalCreditsUsed = Math.abs(transactionsData?.reduce((sum, item) => sum + item.amount, 0) || 0);

      // Get total transactions count
      const { count: totalTransactions } = await supabase
        .from('credit_transactions')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        totalCreditsDistributed,
        totalCreditsUsed,
        totalTransactions: totalTransactions || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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
            <h1 className="text-3xl font-bold text-foreground">Credits & Transactions</h1>
            <p className="text-muted-foreground">Manage user credits and view transaction history</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Users with credit accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Distributed</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCreditsDistributed}</div>
              <p className="text-xs text-muted-foreground">
                Total credits in circulation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCreditsUsed}</div>
              <p className="text-xs text-muted-foreground">
                Total credits consumed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                All credit transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {selectedUserId ? (
          <TransactionHistory 
            selectedUserId={selectedUserId}
            onBack={() => setSelectedUserId(null)}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <UserCreditsManager onUserSelect={setSelectedUserId} />
            <TransactionHistory />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
