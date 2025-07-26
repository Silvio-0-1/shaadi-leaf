
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Sparkles, Users, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { WeddingCardData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useWeddingCards } from '@/hooks/useWeddingCards';
import { toast } from 'sonner';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const templateParam = searchParams.get('template');
  const { user } = useAuth();
  const { saveCard, loadCard, saving } = useWeddingCards();
  
  const [currentStep, setCurrentStep] = useState<'hero'>('hero');
  const [cardData, setCardData] = useState<WeddingCardData>({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    message: '',
    templateId: '',
    uploadedImage: ''
  });

  // Redirect to customize page if editing
  useEffect(() => {
    if (editId) {
      navigate(`/customize?edit=${editId}`);
    }
  }, [editId, navigate]);

  // Redirect to customize page if template is selected
  useEffect(() => {
    if (templateParam) {
      navigate(`/customize?template=${templateParam}`);
    }
  }, [templateParam, navigate]);

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/customize?template=${templateId}`);
  };

  const handleDataChange = (newData: Partial<WeddingCardData>) => {
    setCardData(prev => ({ ...prev, ...newData }));
  };

  const startCreating = () => {
    navigate('/templates');
  };

  const handleSaveCard = async () => {
    if (!user) {
      toast.error('Please sign in to save your wedding card');
      return;
    }

    if (!cardData.brideName || !cardData.groomName || !cardData.templateId) {
      toast.error('Please fill in the bride and groom names');
      return;
    }

    await saveCard(cardData);
  };

  const hasRequiredData = cardData.brideName && cardData.groomName && cardData.templateId;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {currentStep === 'hero' && (
        <div>
          <HeroSection />
          
          {/* Enhanced Features Section */}
          <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 text-foreground px-4">
                  Why Choose Shaadi Leaf?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  We've made creating beautiful wedding invitations simple, fast, and affordable for everyone.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    icon: Sparkles,
                    title: "Premium Quality",
                    description: "High-resolution designs that look stunning both digitally and in print.",
                    stats: "HD Quality"
                  },
                  {
                    icon: Users,
                    title: "User Friendly",
                    description: "Intuitive interface that anyone can use, no technical skills required.",
                    stats: "5 Min Setup"
                  },
                  {
                    icon: Heart,
                    title: "Unlimited Sharing",
                    description: "Share your invitation via WhatsApp, email, or social media instantly.",
                    stats: "Zero Limits"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 sm:p-8 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill={feature.icon === Heart ? "currentColor" : "none"} />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-primary bg-primary/10 px-2 sm:px-3 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 sm:py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="bg-gradient-to-r from-primary/5 via-rose-500/5 to-primary/5 rounded-2xl p-6 sm:p-8 lg:p-12 border border-border/30 mx-4 sm:mx-0">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-4 text-foreground">
                  Ready to Create Something Beautiful?
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                  Join thousands of couples who have already created their perfect wedding invitations.
                </p>
                <Button
                  onClick={startCreating}
                  size="lg"
                  className="wedding-gradient text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group w-full sm:w-auto"
                >
                  Start Creating Now
                  <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-t from-muted/40 to-muted/20 border-t border-border/50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/f8c2c939-c72d-4f7b-ac30-2af4b750ac5b.png" 
                  alt="Shaadi Leaf Logo" 
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain mr-3"
                />
                <span className="font-serif text-xl sm:text-2xl font-semibold text-foreground">Shaadi Leaf</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
                Creating beautiful moments, one invitation at a time. We help couples share their love story 
                with elegance and style.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" fill="currentColor" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li><a href="/templates" className="hover:text-primary transition-colors">Templates</a></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-all">hello@shaadileaf.com</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center flex-wrap">
              <span>© 2024 Shaadi Leaf. Made with</span>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-primary inline mx-1" fill="currentColor" />
              <span>for couples everywhere.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
