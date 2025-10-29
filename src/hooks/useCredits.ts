
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateCreditOperation, validateRateLimit } from '@/lib/security';

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
  DOWNLOAD_PDF: 50,
  DOWNLOAD_VIDEO: 60,
  ADD_MUSIC: 20,
  AI_VOICEOVER: 30,
  AI_INVITE_TEXT: 15,
  AI_GENERATE_MESSAGE: 15,
  SHARE_MAGIC_LINK: 30,
  PREMIUM_TEMPLATE_BASIC: 25,
  PREMIUM_TEMPLATE_PREMIUM: 50,
} as const;

export const useCredits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user credits with better error handling
  const { data: userCredits, isLoading: creditsLoading } = useQuery({
    queryKey: ['userCredits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) {
        console.error('Error fetching credits:', error);
        // Credits should be initialized automatically via server-side triggers
        // No longer attempt client-side initialization for security
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

  // Enhanced deduct credits mutation with security validation
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

      // Client-side validation and rate limiting
      const creditValidation = validateCreditOperation(amount, actionType);
      if (!creditValidation.isValid) {
        throw new Error(creditValidation.error);
      }

      // Additional rate limiting for credit operations
      // AI message generation has a 5 second cooldown
      const isAIGeneration = actionType === 'ai_generate_message';
      const maxOps = isAIGeneration ? 1 : 30;
      const timeWindow = isAIGeneration ? 5/60 : 60; // 5 seconds for AI, 60 minutes for others
      
      const rateLimitCheck = validateRateLimit(`credit_${actionType}`, maxOps, timeWindow);
      if (!rateLimitCheck.isValid) {
        throw new Error(rateLimitCheck.error);
      }

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
    onError: (error: any) => {
      console.error('Error deducting credits:', error);
      const errorMessage = error.message || 'Failed to deduct credits';
      
      if (errorMessage.includes('Rate limit exceeded')) {
        toast.error('Please wait before performing more actions');
      } else if (errorMessage.includes('Insufficient credits')) {
        toast.error('Insufficient credits for this action');
      } else if (errorMessage.includes('Invalid credit amount')) {
        toast.error('Invalid credit amount specified');
      } else {
        toast.error(errorMessage);
      }
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
