
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';
import InsufficientCreditsModal from './InsufficientCreditsModal';
import { toast } from 'sonner';

interface CreditActionButtonProps {
  creditCost: number;
  actionType: string;
  actionName: string;
  onAction: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const CreditActionButton = ({
  creditCost,
  actionType,
  actionName,
  onAction,
  children,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
}: CreditActionButtonProps) => {
  const { user } = useAuth();
  const { balance, hasEnoughCredits, deductCredits } = useCredits();
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (!user) {
      toast.error('Please sign in to perform this action');
      return;
    }

    if (!hasEnoughCredits(creditCost)) {
      setShowInsufficientModal(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      // First deduct credits
      const success = await deductCredits(
        creditCost,
        actionType,
        `${actionName} - ${creditCost} credits`,
        `action_${Date.now()}`
      );

      if (success) {
        // Then perform the action
        await onAction();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error('Failed to complete action');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        variant={variant}
        size={size}
        className={className}
      >
        {isProcessing ? 'Processing...' : children}
      </Button>

      <InsufficientCreditsModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        requiredCredits={creditCost}
        currentBalance={balance}
        actionName={actionName}
      />
    </>
  );
};

export default CreditActionButton;
