import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  action_type: string | null;
  reference_id: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface TransactionHistoryProps {
  selectedUserId?: string;
  onBack?: () => void;
}

export const TransactionHistory = ({ selectedUserId, onBack }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // First get transactions
      let query = supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedUserId) {
        query = query.eq('user_id', selectedUserId);
      }

      const { data: transactionsData, error: transactionsError } = await query;

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast.error('Failed to load transaction history');
        return;
      }

      // Then get profiles for all users
      const userIds = transactionsData?.map(transaction => transaction.user_id) || [];
      const uniqueUserIds = [...new Set(userIds)];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', uniqueUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        toast.error('Failed to load user profiles');
        return;
      }

      // Combine the data
      const combinedData = transactionsData?.map(transaction => {
        const profile = profilesData?.find(p => p.id === transaction.user_id);
        return {
          ...transaction,
          profiles: profile ? {
            full_name: profile.full_name,
            email: profile.email
          } : null
        };
      }) || [];

      setTransactions(combinedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedUserId]);

  const exportTransactions = async () => {
    try {
      const filteredTransactions = getFilteredTransactions();
      const csvContent = [
        ['Date', 'User', 'Email', 'Amount', 'Type', 'Description', 'Action Type', 'Reference ID'],
        ...filteredTransactions.map(t => [
          format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
          t.profiles?.full_name || 'N/A',
          t.profiles?.email || 'N/A',
          t.amount.toString(),
          t.transaction_type,
          t.description,
          t.action_type || 'N/A',
          t.reference_id || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credit_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Transaction history exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transaction history');
    }
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const matchesSearch = searchTerm === '' || 
        (t.profiles?.email && t.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.profiles?.full_name && t.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || t.transaction_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  };

  const getTransactionBadge = (amount: number, type: string) => {
    if (amount > 0) {
      return <Badge variant="default">+{amount}</Badge>;
    } else {
      return <Badge variant="destructive">{amount}</Badge>;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'signup_bonus':
        return 'bg-green-100 text-green-800';
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'deduction':
        return 'bg-red-100 text-red-800';
      case 'admin_credit':
        return 'bg-purple-100 text-purple-800';
      case 'admin_debit':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
            {selectedUserId && (
              <Badge variant="outline">
                {transactions[0]?.profiles?.full_name || 'User'} Transactions
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back to Users
              </Button>
            )}
            <Button onClick={exportTransactions}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="signup_bonus">Signup Bonus</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="deduction">Deduction</SelectItem>
                <SelectItem value="admin_credit">Admin Credit</SelectItem>
                <SelectItem value="admin_debit">Admin Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {!selectedUserId && <TableHead>User</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredTransactions().map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    {!selectedUserId && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.profiles?.full_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{transaction.profiles?.email || 'N/A'}</div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {getTransactionBadge(transaction.amount, transaction.transaction_type)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                        {transaction.transaction_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={transaction.description}>
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      {transaction.action_type ? (
                        <Badge variant="outline">{transaction.action_type.replace('_', ' ')}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.reference_id ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {transaction.reference_id}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {getFilteredTransactions().length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
