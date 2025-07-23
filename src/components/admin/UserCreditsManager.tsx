import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, User, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface UserCredit {
  id: string;
  user_id: string;
  balance: number;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

interface CreditManagementProps {
  onUserSelect: (userId: string) => void;
}

export const UserCreditsManager = ({ onUserSelect }: CreditManagementProps) => {
  const { user } = useAuth();
  const [userCredits, setUserCredits] = useState<UserCredit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserCredit | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserCredits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_credits')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('balance', { ascending: false });

      if (error) {
        console.error('Error fetching user credits:', error);
        toast.error('Failed to load user credits');
        return;
      }

      // Handle the case where profiles might be null or an error
      const validUserCredits = (data || []).map(credit => ({
        ...credit,
        profiles: credit.profiles && 
                  typeof credit.profiles === 'object' && 
                  !('error' in credit.profiles) &&
                  'email' in credit.profiles
          ? credit.profiles as { full_name: string | null; email: string }
          : null
      }));

      setUserCredits(validUserCredits);
    } catch (error) {
      console.error('Error fetching user credits:', error);
      toast.error('Failed to load user credits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const handleManageCredits = async (operation: 'add' | 'deduct') => {
    if (!selectedUser || !creditAmount || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('admin_manage_credits', {
        p_target_user_id: selectedUser.user_id,
        p_amount: parseInt(creditAmount),
        p_operation: operation,
        p_description: description.trim(),
        p_admin_user_id: user?.id
      });

      if (error) throw error;

      if (data) {
        toast.success(`Credits ${operation === 'add' ? 'added' : 'deducted'} successfully`);
        setIsManageDialogOpen(false);
        setSelectedUser(null);
        setCreditAmount('');
        setDescription('');
        fetchUserCredits();
      } else {
        toast.error('Insufficient credits for deduction');
      }
    } catch (error) {
      console.error('Error managing credits:', error);
      toast.error('Failed to manage credits');
    }
  };

  const filteredUsers = userCredits.filter(uc => 
    uc.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uc.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeVariant = (balance: number) => {
    if (balance > 50) return 'default';
    if (balance > 20) return 'secondary';
    return 'destructive';
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
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          User Credits Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userCredit) => (
                  <TableRow key={userCredit.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {userCredit.profiles?.full_name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{userCredit.profiles?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(userCredit.balance)}>
                        {userCredit.balance} credits
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(userCredit);
                            setIsManageDialogOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUserSelect(userCredit.user_id)}
                        >
                          View History
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Credits</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label>User: {selectedUser.profiles?.full_name || 'N/A'}</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.profiles?.email || 'N/A'}</p>
                  <p className="text-sm">Current Balance: {selectedUser.balance} credits</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Reason for credit adjustment"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleManageCredits('add')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Credits
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleManageCredits('deduct')}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Deduct Credits
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
