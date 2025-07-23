
import { useState } from 'react';
import { Check, Heart, Crown, Sparkles, Download, Share2, Image, FileText, Video, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for trying out our platform',
      features: [
        'Up to 3 wedding card downloads',
        'Access to basic templates',
        'Image & PDF formats',
        'Public share link',
        'Watermark on exports'
      ],
      cta: 'Start for Free',
      icon: Heart,
      popular: false,
      color: 'from-rose-50 to-pink-50'
    },
    {
      name: 'Premium',
      price: isAnnual ? '₹2,390' : '₹299',
      period: isAnnual ? 'per year' : 'per month',
      originalPrice: isAnnual ? '₹3,588' : undefined,
      description: 'Everything you need for your perfect day',
      features: [
        'Unlimited downloads',
        'Access to all templates (premium included)',
        'Video card creation (with music)',
        'High-resolution exports',
        'Watermark removed',
        'Reusable uploads & saved cards',
        'Priority email support'
      ],
      cta: `Upgrade to Premium`,
      icon: Crown,
      popular: true,
      color: 'from-gradient-to-r from-rose-100 to-pink-100'
    },
    {
      name: 'Pro',
      price: isAnnual ? '₹4,790' : '₹599',
      period: isAnnual ? 'per year' : 'per month',
      originalPrice: isAnnual ? '₹7,188' : undefined,
      description: 'For couples who want it all',
      features: [
        'Everything in Premium',
        'Advanced video effects',
        'Custom music uploads',
        'Priority support (24/7)',
        'Early access to new templates',
        'White-label exports',
        'Dedicated account manager'
      ],
      cta: 'Go Pro',
      icon: Sparkles,
      popular: false,
      color: 'from-amber-50 to-orange-50'
    }
  ];

  const testimonials = [
    {
      name: 'Priya & Arjun',
      text: "The video cards were absolutely stunning! Our guests couldn't stop talking about how unique and beautiful they were.",
      rating: 5
    },
    {
      name: 'Sarah & Michael',
      text: "So easy to use and the templates are gorgeous. We saved so much money and time compared to traditional cards!",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Can I try before I pay?",
      answer: "Absolutely! Our free plan lets you create up to 3 wedding cards with basic templates. You can upgrade anytime when you're ready for more features."
    },
    {
      question: "Do I need to install anything?",
      answer: "No installation required! Our platform works directly in your web browser. Just sign up and start creating beautiful wedding cards instantly."
    },
    {
      question: "What formats can I download my card in?",
      answer: "Free users get image and PDF formats. Premium and Pro users also get access to video card creation with music and advanced effects."
    },
    {
      question: "Can I upgrade later?",
      answer: "Yes! You can upgrade your plan at any time. All your saved cards and uploads will be preserved when you upgrade."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-rose-50/30 to-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-primary mr-3" fill="currentColor" />
            <Sparkles className="h-8 w-8 text-primary/70" />
          </div>
          
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Make Your Big Day 
            <br />
            <span className="wedding-gradient bg-clip-text text-transparent">
              Extra Special
            </span>
            <br />
            — For Free or Forever
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your celebration. Start free, upgrade only when you need to.
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`mr-3 ${!isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                Save 33%
              </Badge>
            )}
          </div>
          
          <Button 
            size="lg" 
            className="wedding-gradient text-white px-8 py-4 text-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            Start Creating
          </Button>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.name}
                  className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular 
                      ? 'border-primary shadow-lg scale-105' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className={`text-center pb-4 ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                    <div className="flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="flex items-center justify-center">
                        {plan.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through mr-2">
                            {plan.originalPrice}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-foreground">
                          {plan.price}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pt-4">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'wedding-gradient text-white hover:shadow-lg' 
                          : 'border border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">
            Compare Plans
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Features</th>
                    <th className="text-center p-4 font-medium">Free</th>
                    <th className="text-center p-4 font-medium bg-primary/10">Premium</th>
                    <th className="text-center p-4 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4 font-medium">Downloads</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4 bg-primary/5">Unlimited</td>
                    <td className="text-center p-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Templates</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4 bg-primary/5">All Premium</td>
                    <td className="text-center p-4">All Premium</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Video Cards</td>
                    <td className="text-center p-4">✗</td>
                    <td className="text-center p-4 bg-primary/5">✓</td>
                    <td className="text-center p-4">✓ + Effects</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Watermark</td>
                    <td className="text-center p-4">Yes</td>
                    <td className="text-center p-4 bg-primary/5">Removed</td>
                    <td className="text-center p-4">Removed</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Support</td>
                    <td className="text-center p-4">Community</td>
                    <td className="text-center p-4 bg-primary/5">Email</td>
                    <td className="text-center p-4">24/7 Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">
            What Couples Are Saying
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <p className="font-medium text-foreground">
                    — {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg border border-border px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-12 border border-primary/20">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" fill="currentColor" />
            <h2 className="text-3xl font-serif font-semibold mb-4">
              Ready to Create Your Perfect Wedding Card?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of couples who have made their special day even more memorable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="wedding-gradient text-white px-8">
                Start for Free
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                View Templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/5d39d537-b4a5-4aa1-9dc2-8715f6e06948.png" 
              alt="Shaadi Leaf Logo" 
              className="h-6 w-6 object-contain mr-2"
            />
            <span className="font-serif text-xl font-semibold">Digital Wedding Cards</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Creating beautiful moments, one card at a time
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for couples everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
