
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  bonus_credits: number;
  price_inr: number;
  popular: boolean;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  action_type?: string;
  created_at: string;
}

export const CREDIT_COSTS = {
  DOWNLOAD_LOW_RES: 15,
  DOWNLOAD_HIGH_RES: 30,
  DOWNLOAD_PDF: 40,
  DOWNLOAD_VIDEO: 60,
  ADD_MUSIC: 20,
  AI_VOICEOVER: 30,
  AI_INVITE_TEXT: 15,
  PREMIUM_TEMPLATE_BASIC: 25,
  PREMIUM_TEMPLATE_PREMIUM: 50,
} as const;

export const useCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user credits
  const { data: userCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ['userCredits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch credit packages
  const { data: creditPackages, isLoading: packagesLoading } = useQuery({
    queryKey: ['creditPackages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('active', true)
        .order('price_inr', { ascending: true });

      if (error) {
        console.error('Error fetching packages:', error);
        return [];
      }
      return data as CreditPackage[];
    },
  });

  // Fetch credit transactions
  const { data: transactions } = useQuery({
    queryKey: ['creditTransactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      return data as CreditTransaction[];
    },
    enabled: !!user,
  });

  // Deduct credits mutation
  const deductCreditsMutation = useMutation({
    mutationFn: async ({ 
      amount, 
      actionType, 
      description, 
      referenceId 
    }: {
      amount: number;
      actionType: string;
      description: string;
      referenceId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_action_type: actionType,
        p_description: description,
        p_reference_id: referenceId || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (success, variables) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['userCredits'] });
        queryClient.invalidateQueries({ queryKey: ['creditTransactions'] });
        toast.success(`Credits deducted successfully! ${variables.description}`);
      } else {
        toast.error('Insufficient credits for this action');
      }
    },
    onError: (error) => {
      console.error('Error deducting credits:', error);
      toast.error('Failed to deduct credits');
    },
  });

  const deductCredits = async (
    amount: number,
    actionType: string,
    description: string,
    referenceId?: string
  ): Promise<boolean> => {
    try {
      const result = await deductCreditsMutation.mutateAsync({
        amount,
        actionType,
        description,
        referenceId,
      });
      return result as boolean;
    } catch (error) {
      return false;
    }
  };

  const hasEnoughCredits = (amount: number): boolean => {
    return (userCredits?.balance || 0) >= amount;
  };

  const balance = userCredits?.balance || 0;

  return {
    balance,
    userCredits,
    creditPackages: creditPackages || [],
    transactions: transactions || [],
    creditsLoading,
    packagesLoading,
    deductCredits,
    hasEnoughCredits,
    CREDIT_COSTS,
  };
};
