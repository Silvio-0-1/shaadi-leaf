
import { Coins } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';
import { Badge } from '@/components/ui/badge';

const CreditBalance = () => {
  const { balance, creditsLoading } = useCredits();

  if (creditsLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Coins className="h-4 w-4 text-yellow-500 animate-pulse" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Coins className="h-4 w-4 text-yellow-500" />
      <Badge 
        variant={balance > 50 ? "default" : balance > 20 ? "secondary" : "destructive"}
        className="font-medium"
      >
        {balance} Credits
      </Badge>
    </div>
  );
};

export default CreditBalance;
