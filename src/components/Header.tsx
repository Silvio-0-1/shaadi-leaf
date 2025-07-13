
import { Heart, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold text-foreground">
            Digital Wedding Cards
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button size="sm" className="wedding-gradient text-white">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
