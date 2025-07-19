
import { Heart, Sparkles, Users, Download, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background with animated elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gold-500/5 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto max-w-7xl relative">
        {/* Main Hero Content */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center mb-8 animate-fade-in">
            <div className="relative">
              <Heart className="h-20 w-20 text-primary mr-4 heart-float" fill="currentColor" />
              <Sparkles className="h-8 w-8 text-primary/70 absolute -top-2 -right-2 sparkle-animation" />
            </div>
          </div>
          
          <h1 className="font-serif text-6xl md:text-8xl font-bold text-foreground mb-8 leading-tight animate-slide-up">
            Create Your Perfect
            <br />
            <span className="wedding-gradient bg-clip-text text-transparent relative">
              Wedding Invitation
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 wedding-gradient rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in delay-300">
            Transform your special day into a stunning digital experience. Design, customize, and share 
            beautiful wedding invitations that capture the essence of your love story.
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 animate-fade-in delay-500">
            <div className="flex items-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 hover-lift">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium">No Design Experience Required</span>
            </div>
            <div className="flex items-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 hover-lift">
              <Star className="h-4 w-4 text-gold-500 mr-2" fill="currentColor" />
              <span className="text-sm font-medium">Premium Templates</span>
            </div>
            <div className="flex items-center bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 hover-lift">
              <Download className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium">Instant Download</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in delay-700">
            <Button 
              size="lg" 
              className="wedding-gradient text-white px-12 py-6 text-lg font-semibold rounded-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              Start Creating Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Enhanced Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Sparkles,
              title: "Beautiful Templates",
              description: "Choose from our curated collection of professionally designed templates that match your unique style and personality.",
              color: "text-primary"
            },
            {
              icon: Heart,
              title: "Easy Customization",
              description: "Personalize every detail with our intuitive editor. Add your photos, change colors, and make it uniquely yours.",
              color: "text-rose-500"
            },
            {
              icon: Download,
              title: "Multiple Formats",
              description: "Download high-quality images, PDFs, or share directly via social media and messaging apps.",
              color: "text-gold-500"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className={`group p-8 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 animate-fade-in`}
              style={{ animationDelay: `${800 + index * 150}ms` }}
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} fill={feature.icon === Heart ? "currentColor" : "none"} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/10 rounded-full animate-pulse"></div>
              </div>
              <h3 className="font-serif text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Enhanced Sample Preview */}
        <div className="mb-16">
          <h2 className="font-serif text-4xl font-semibold mb-4 text-center animate-fade-in">
            Stunning Templates for Every Style
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto animate-fade-in delay-200">
            From elegant classics to modern minimalist designs, find the perfect template for your celebration.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto animate-fade-in delay-400">
            {[
              { gradient: "from-rose-100 to-pink-100", icon: Heart, label: "Romantic" },
              { gradient: "from-gold-100 to-yellow-100", icon: Star, label: "Elegant" },
              { gradient: "from-purple-100 to-indigo-100", icon: Sparkles, label: "Modern" },
              { gradient: "from-green-100 to-teal-100", icon: Users, label: "Classic" }
            ].map((template, i) => (
              <div 
                key={i}
                className={`group aspect-[3/4] bg-gradient-to-br ${template.gradient} rounded-xl border border-border/30 flex flex-col items-center justify-center hover:scale-105 transition-all duration-500 hover:shadow-lg cursor-pointer romantic-glow`}
              >
                <template.icon className="h-12 w-12 text-primary/60 mb-3 group-hover:scale-110 transition-transform" fill={template.icon === Heart ? "currentColor" : "none"} />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  {template.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="relative bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 rounded-3xl p-12 md:p-16 text-center animate-fade-in delay-600">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-rose-500/5 to-primary/5 rounded-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 bg-primary/10 rounded-full border-2 border-background flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                  </div>
                ))}
              </div>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6 text-foreground">
              Join 10,000+ Happy Couples
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Create your dream wedding invitation in minutes. No design skills needed, just your love story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="wedding-gradient text-white px-8 py-4 text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 hover:bg-primary/5 transition-all duration-300"
              >
                View Templates
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
