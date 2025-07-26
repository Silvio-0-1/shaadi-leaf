import { useState } from 'react';
import { LogIn } from 'lucide-react';
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
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
              <img 
                src="/lovable-uploads/f8c2c939-c72d-4f7b-ac30-2af4b750ac5b.png" 
                alt="Shaadi Leaf" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <DialogTitle className="text-center text-xl">
              Shaadi Leaf
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              <span className="text-primary font-medium">
                You can {action.toLowerCase()} for free after signing in
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            
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