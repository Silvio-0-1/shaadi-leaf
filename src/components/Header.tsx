
import { useState } from 'react';
import { Heart, Menu, X, User, LogOut, Settings, ShoppingCart, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import CreditBalance from './CreditBalance';
import CreditStore from './CreditStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreditStore, setShowCreditStore] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img 
                src="/lovable-uploads/5d39d537-b4a5-4aa1-9dc2-8715f6e06948.png" 
                alt="Shaadi Leaf Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="font-serif text-xl font-semibold text-foreground">
                Shaadi Leaf
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                to="/contact" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Contact
              </Link>
              <Link 
                to="/templates" 
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Templates
              </Link>
              {user && (
                <Link 
                  to="/dashboard" 
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  My Cards
                </Link>
              )}
            </nav>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <CreditBalance />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreditStore(true)}
                    className="flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Buy Credits</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="truncate max-w-32">
                          {user.email?.split('@')[0] || 'User'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/auth">
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="wedding-gradient text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50">
              <nav className="flex flex-col space-y-3">
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  to="/templates" 
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Templates
                </Link>
                {user && (
                  <Link 
                    to="/dashboard" 
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Cards
                  </Link>
                )}
                
                <div className="pt-4 border-t border-border/50">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Signed in as {user.email?.split('@')[0]}
                        </p>
                        <CreditBalance />
                      </div>
                       <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowCreditStore(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full justify-start touch-manipulation min-h-[44px]"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Credits
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="w-full justify-start touch-manipulation min-h-[44px]"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                     <div className="space-y-3">
                       <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                         <Button variant="outline" className="w-full justify-start touch-manipulation min-h-[44px]">
                           Sign In
                         </Button>
                       </Link>
                       <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                         <Button className="wedding-gradient text-white w-full touch-manipulation min-h-[44px]">
                           Get Started
                         </Button>
                       </Link>
                     </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <CreditStore 
        isOpen={showCreditStore}
        onClose={() => setShowCreditStore(false)}
      />
    </>
  );
};

export default Header;
