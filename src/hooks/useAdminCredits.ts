import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserWithCredits {
  id: string;
  email: string;
  full_name: string | null;
  balance: number;
  created_at: string;
}

export const useAdminCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all users with their credit balances
  const { data: usersWithCredits, isLoading } = useQuery({
    queryKey: ['adminUsersCredits'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      // Then get credit balances for each user
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('user_id, balance, created_at');

      if (creditsError) throw creditsError;

      // Combine the data
      return (profiles || []).map(profile => {
        const userCredit = credits?.find(c => c.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          balance: userCredit?.balance || 0,
          created_at: userCredit?.created_at || profile.created_at,
        };
      }) as UserWithCredits[];
    },
    enabled: !!user,
  });

  // Admin manage credits mutation
  const manageCredits = useMutation({
    mutationFn: async ({
      targetUserId,
      amount,
      operation,
      description,
    }: {
      targetUserId: string;
      amount: number;
      operation: 'add' | 'deduct';
      description: string;
    }) => {
      if (!user) throw new Error('Admin not authenticated');

      const { data, error } = await supabase.rpc('admin_manage_credits', {
        p_target_user_id: targetUserId,
        p_amount: amount,
        p_operation: operation,
        p_description: description,
        p_admin_user_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['adminUsersCredits'] });
        queryClient.invalidateQueries({ queryKey: ['userCredits'] });
        queryClient.invalidateQueries({ queryKey: ['creditTransactions'] });
        toast.success(`Successfully ${variables.operation === 'add' ? 'added' : 'deducted'} ${variables.amount} credits`);
      } else {
        toast.error(variables.operation === 'deduct' ? 'Insufficient credits for deduction' : 'Failed to manage credits');
      }
    },
    onError: (error: any) => {
      console.error('Error managing credits:', error);
      toast.error(error.message || 'Failed to manage credits');
    },
  });

  const addCredits = (targetUserId: string, amount: number, description: string) => {
    return manageCredits.mutateAsync({
      targetUserId,
      amount,
      operation: 'add',
      description,
    });
  };

  const deductCredits = (targetUserId: string, amount: number, description: string) => {
    return manageCredits.mutateAsync({
      targetUserId,
      amount,
      operation: 'deduct',
      description,
    });
  };

  return {
    usersWithCredits: usersWithCredits || [],
    isLoading,
    addCredits,
    deductCredits,
    isManaging: manageCredits.isPending,
  };
};