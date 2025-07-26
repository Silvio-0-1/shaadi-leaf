import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Palette, X, Sparkles, Image, Video, Layout, Type, Palette as PaletteIcon } from 'lucide-react';
import { Template } from '@/types';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomize: (template: Template) => void;
}

const TemplatePreviewModal = ({
  template,
  isOpen,
  onClose,
  onCustomize
}: TemplatePreviewModalProps) => {
  if (!template) return null;

  // Sample data for preview
  const sampleData = {
    brideName: "Priya",
    groomName: "Arjun",
    weddingDate: "December 15, 2024",
    venue: "The Grand Palace, Mumbai",
    message: "With hearts full of love and joy, we invite you to celebrate our union"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden border-0 bg-gradient-to-br from-background via-background/98 to-background/95 backdrop-blur-xl">
        
        {/* Header */}
        <div className="relative border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">{template.name}</h1>
              </div>
              {template.isPremium && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1 text-sm font-medium">
                  <Crown className="h-4 w-4 mr-1" />
                  Premium Template
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            
            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              
              {/* Left Side - Template Preview */}
              <div className="flex-1 lg:max-w-md">
                <div className="sticky top-4">
                  <div className="text-center mb-6">
                    <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-2">Live Preview</h2>
                    <p className="text-muted-foreground text-sm lg:text-base">See how your invitation will look</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-sm">
                      <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-2xl border border-border/20 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm">
                        {/* Background */}
                        {template.backgroundImage ? (
                          <img 
                            src={template.backgroundImage}
                            alt="Template background"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full bg-gradient-to-br from-current to-transparent opacity-20"
                            style={{ color: template.colors.secondary }}
                          />
                        )}
                        
                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 lg:p-6 text-center">
                          <div 
                            className="space-y-3 lg:space-y-4 backdrop-blur-sm bg-white/10 rounded-xl p-4 lg:p-6 border border-white/20"
                            style={{ color: template.colors.primary }}
                          >
                            <div className="space-y-1">
                              <h1 className="text-lg lg:text-2xl font-serif font-bold leading-tight">
                                {sampleData.brideName}
                              </h1>
                              <div className="text-lg lg:text-2xl">💕</div>
                              <h1 className="text-lg lg:text-2xl font-serif font-bold leading-tight">
                                {sampleData.groomName}
                              </h1>
                            </div>
                            
                            <div className="h-px bg-current opacity-30"></div>
                            
                            <div className="space-y-2">
                              <p className="text-sm lg:text-base font-medium">{sampleData.weddingDate}</p>
                              <p className="text-xs lg:text-sm opacity-90">{sampleData.venue}</p>
                            </div>
                            
                            <div className="h-px bg-current opacity-30"></div>
                            
                            <p className="text-xs lg:text-sm italic leading-relaxed max-w-xs mx-auto opacity-90">
                              {sampleData.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Template Details */}
              <div className="flex-1 lg:max-w-2xl">
                <div className="space-y-8">
                  
                  {/* Section Header */}
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-2">Template Details</h2>
                    <p className="text-muted-foreground">Everything you need to know about this template</p>
                  </div>
                  
                  {/* Details Grid */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    
                    {/* Category */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm lg:text-base">Category</h3>
                        </div>
                        <p className="capitalize text-base lg:text-lg font-medium text-foreground">{template.category}</p>
                      </CardContent>
                    </Card>

                    {/* Features */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Layout className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm lg:text-base">Features</h3>
                        </div>
                        <div className="space-y-2">
                          {template.supportsMultiPhoto && (
                            <div className="flex items-center gap-2">
                              <Image className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                              <span className="text-xs lg:text-sm">Multi-Photo Support</span>
                            </div>
                          )}
                          {template.supportsVideo && (
                            <div className="flex items-center gap-2">
                              <Video className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                              <span className="text-xs lg:text-sm">Video Support</span>
                            </div>
                          )}
                          {template.layouts && template.layouts.length > 1 && (
                            <div className="flex items-center gap-2">
                              <Layout className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500" />
                              <span className="text-xs lg:text-sm">Multiple Layouts</span>
                            </div>
                          )}
                          {!template.supportsMultiPhoto && !template.supportsVideo && (!template.layouts || template.layouts.length <= 1) && (
                            <span className="text-xs lg:text-sm text-muted-foreground">Standard features</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Color Palette */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <PaletteIcon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm lg:text-base">Color Palette</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-border shadow-sm"
                              style={{ backgroundColor: template.colors.primary }}
                            />
                            <span className="text-xs lg:text-sm font-medium">Primary</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-border shadow-sm"
                              style={{ backgroundColor: template.colors.secondary }}
                            />
                            <span className="text-xs lg:text-sm font-medium">Secondary</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-border shadow-sm"
                              style={{ backgroundColor: template.colors.accent }}
                            />
                            <span className="text-xs lg:text-sm font-medium">Accent</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Typography */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Type className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm lg:text-base">Typography</h3>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Heading Font</span>
                            <p className="text-sm lg:text-base font-medium">{template.fonts.heading}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Body Font</span>
                            <p className="text-sm lg:text-base font-medium">{template.fonts.body}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Layouts */}
                    {template.layouts && template.layouts.length > 0 && (
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors sm:col-span-2">
                        <CardContent className="p-4 lg:p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Layout className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground text-sm lg:text-base">Available Layouts</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {template.layouts.map((layout) => (
                              <Badge key={layout} variant="outline" className="text-xs">
                                {layout}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="text-center lg:text-left pt-4">
                    <Button 
                      onClick={() => onCustomize(template)}
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-4 text-base lg:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <Palette className="h-5 w-5 mr-3" />
                      Start Customizing This Template
                    </Button>
                    <p className="text-xs lg:text-sm text-muted-foreground mt-3">
                      Personalize colors, text, images, and more
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;