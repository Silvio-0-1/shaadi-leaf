
import { useState } from 'react';
import { AlertTriangle, Coins, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CreditStore from './CreditStore';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits: number;
  currentBalance: number;
  actionName: string;
}

const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  requiredCredits,
  currentBalance,
  actionName,
}: InsufficientCreditsModalProps) => {
  const [showStore, setShowStore] = useState(false);
  const shortfall = requiredCredits - currentBalance;

  if (showStore) {
    return (
      <CreditStore 
        isOpen={isOpen}
        onClose={onClose}
        suggestedAmount={shortfall}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <DialogTitle className="text-center">
            Insufficient Credits
          </DialogTitle>
          <DialogDescription className="text-center">
            You need more credits to {actionName.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Required:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {requiredCredits}
              </Badge>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Your balance:</span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {currentBalance}
              </Badge>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">You need:</span>
              <Badge variant="destructive" className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {shortfall} more credits
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => setShowStore(true)}
              className="w-full"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Buy Credits
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsufficientCreditsModal;
