import { useState } from 'react';
import { Heart, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AuthDialog from './AuthDialog';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
}

const AuthRequiredModal = ({
  isOpen,
  onClose,
  action,
}: AuthRequiredModalProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleSignInClick = () => {
    setShowAuthDialog(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    onClose();
  };

  const handleAuthDialogClose = (open: boolean) => {
    setShowAuthDialog(open);
    if (!open) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showAuthDialog} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full">
              <Heart className="w-8 h-8 text-primary" fill="currentColor" />
            </div>
            <DialogTitle className="text-center text-xl">
              Sign In Required
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              <span className="text-primary font-medium">
                You can {action.toLowerCase()} for free after signing in
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <p className="text-sm text-muted-foreground text-center">
              Create your account or sign in to access all features and save your beautiful wedding cards.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleSignInClick}
                className="w-full wedding-gradient text-white"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In / Create Account
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

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={handleAuthDialogClose}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default AuthRequiredModal;