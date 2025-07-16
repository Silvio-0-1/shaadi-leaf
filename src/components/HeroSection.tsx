
import { Heart, Sparkles, Users, Download } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="py-20 px-4 text-center bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Main Hero Content */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-16 w-16 text-primary mr-4" fill="currentColor" />
            <Sparkles className="h-12 w-12 text-primary/70" />
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Digital Wedding
            <br />
            <span className="wedding-gradient bg-clip-text text-transparent">
              Invitations
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Create stunning, personalized wedding cards in minutes. 
            Share your special day with beautiful digital invitations that your guests will treasure.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>No Design Skills Required</span>
            </div>
            <div className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              <span>Instant Download</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2" fill="currentColor" />
              <span>Unlimited Sharing</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Beautiful Templates</h3>
            <p className="text-muted-foreground">
              Choose from professionally designed templates that match your wedding style perfectly.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Easy Customization</h3>
            <p className="text-muted-foreground">
              Personalize every detail with your names, date, venue, and special message.
            </p>
          </div>
          
          <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-3">Instant Download</h3>
            <p className="text-muted-foreground">
              Download high-quality images and PDFs ready to share digitally or print.
            </p>
          </div>
        </div>

        {/* Sample Cards Preview */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold mb-8 text-foreground">
            Beautiful Templates for Every Style
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-primary/15 rounded-lg border border-border/30 flex items-center justify-center hover:scale-105 transition-transform duration-300"
              >
                <Heart className="h-8 w-8 text-primary/40" fill="currentColor" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-foreground">
            Ready to Create Your Perfect Wedding Card?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of couples who have created their dream wedding invitations with our platform.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
