
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Download, Palette } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 wedding-gradient opacity-5"></div>
        <div className="absolute top-20 left-10 floating-animation">
          <Heart className="h-8 w-8 text-primary/20" fill="currentColor" />
        </div>
        <div className="absolute top-40 right-20 floating-animation delay-100">
          <Sparkles className="h-6 w-6 text-primary/20" />
        </div>
        <div className="absolute bottom-20 left-20 floating-animation delay-200">
          <Heart className="h-6 w-6 text-primary/20" fill="currentColor" />
        </div>
      </div>

      <div className="container max-w-4xl mx-auto">
        <div className="fade-in-up">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
            Create Beautiful
            <span className="block text-primary">Wedding Cards</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Design stunning digital wedding invitations in minutes. Choose from elegant templates, 
            customize with your details, and share with loved ones instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="wedding-gradient text-white px-8 py-6 text-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              <Palette className="h-5 w-5 mr-2" />
              Start Creating
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary/5"
            >
              <Download className="h-5 w-5 mr-2" />
              View Samples
            </Button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Customization</h3>
              <p className="text-muted-foreground text-sm">
                Simple form-based editing with live preview
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" fill="currentColor" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Beautiful Templates</h3>
              <p className="text-muted-foreground text-sm">
                Professionally designed templates for every style
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Download</h3>
              <p className="text-muted-foreground text-sm">
                Download high-quality images or PDFs immediately
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
