
import { useState } from 'react';
import { Check, Crown, Sparkles, CreditCard, Coins } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCredits } from '@/hooks/useCredits';
import { toast } from 'sonner';

interface CreditStoreProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedAmount?: number;
}

const CreditStore = ({ isOpen, onClose, suggestedAmount }: CreditStoreProps) => {
  const { creditPackages, packagesLoading, balance } = useCredits();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packageId: string) => {
    setPurchasing(true);
    setSelectedPackage(packageId);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Process payment with payment gateway
      // 2. Call add_credits function upon successful payment
      // 3. Update user's credit balance
      
      toast.success('Credits purchased successfully!');
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const getRecommendedPackage = () => {
    if (!suggestedAmount) return null;
    return creditPackages.find(pkg => 
      (pkg.credits + pkg.bonus_credits) >= suggestedAmount
    );
  };

  const recommendedPackage = getRecommendedPackage();

  if (packagesLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Buy Credits
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose a credit package to continue creating amazing wedding cards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <div className="flex items-center justify-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{balance}</span>
              <span className="text-muted-foreground">credits</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  pkg.popular ? 'ring-2 ring-primary scale-105' : ''
                } ${recommendedPackage?.id === pkg.id ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => !purchasing && handlePurchase(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                {recommendedPackage?.id === pkg.id && (
                  <Badge className="absolute -top-2 right-2 bg-green-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    <div className="text-2xl font-bold text-foreground">
                      ₹{(pkg.price_inr / 100).toFixed(0)}
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{pkg.credits} Credits</span>
                    </div>
                    {pkg.bonus_credits > 0 && (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm">+{pkg.bonus_credits} Bonus Credits</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Total: {pkg.credits + pkg.bonus_credits} credits
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={purchasing}
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    {purchasing && selectedPackage === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Buy Now
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              🔒 Secure payment • 💳 All major cards accepted • 🔄 Instant credit delivery
            </p>
            <Button variant="ghost" onClick={onClose} disabled={purchasing}>
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditStore;
