
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
          <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-6 text-foreground">
                  Why Choose Shaadi Leaf?
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  We've made creating beautiful wedding invitations simple, fast, and affordable for everyone.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <feature.icon className="h-6 w-6 text-primary" fill={feature.icon === Heart ? "currentColor" : "none"} />
                      </div>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="bg-gradient-to-r from-primary/5 via-rose-500/5 to-primary/5 rounded-2xl p-12 border border-border/30">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-foreground">
                  Ready to Create Something Beautiful?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of couples who have already created their perfect wedding invitations.
                </p>
                <Button
                  onClick={startCreating}
                  size="lg"
                  className="wedding-gradient text-white px-10 py-4 text-lg font-semibold rounded-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  Start Creating Now
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-t from-muted/40 to-muted/20 border-t border-border/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-primary mr-3" fill="currentColor" />
                <span className="font-serif text-2xl font-semibold text-foreground">Shaadi Leaf</span>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                Creating beautiful moments, one invitation at a time. We help couples share their love story 
                with elegance and style.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Heart className="h-5 w-5 text-primary" fill="currentColor" />
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/templates" className="hover:text-primary transition-colors">Templates</a></li>
                <li><a href="/pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">hello@shaadileaf.com</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Shaadi Leaf. Made with <Heart className="h-4 w-4 text-primary inline mx-1" fill="currentColor" /> for couples everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
