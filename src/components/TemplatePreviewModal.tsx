import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Palette, X } from 'lucide-react';
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
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl font-serif">{template.name}</DialogTitle>
              {template.isPremium && (
                <Badge className="bg-gradient-elegant text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6 p-6 pt-0">
            {/* Preview Card */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Live Preview</h3>
              <div className="relative aspect-[3/4] bg-gradient-subtle rounded-lg overflow-hidden shadow-elegant">
                {/* Background */}
                {template.backgroundImage ? (
                  <img 
                    src={template.backgroundImage}
                    alt="Template background"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{ backgroundColor: template.colors.secondary }}
                  />
                )}
                
                {/* Overlay with sample content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div 
                    className="space-y-4"
                    style={{ color: template.colors.primary }}
                  >
                    <h1 className="text-2xl font-serif font-bold">
                      {sampleData.brideName} & {sampleData.groomName}
                    </h1>
                    <div className="text-lg">💕</div>
                    <div className="space-y-2">
                      <p className="font-medium">{sampleData.weddingDate}</p>
                      <p className="text-sm">{sampleData.venue}</p>
                    </div>
                    <p className="text-sm italic max-w-xs">
                      {sampleData.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Details */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Template Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <p className="capitalize font-medium">{template.category}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Features:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {template.supportsMultiPhoto && (
                        <Badge variant="secondary">Multi-Photo Support</Badge>
                      )}
                      {template.supportsVideo && (
                        <Badge variant="secondary">Video Support</Badge>
                      )}
                      {template.layouts && template.layouts.length > 1 && (
                        <Badge variant="secondary">Multiple Layouts</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Color Scheme:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: template.colors.primary }}
                        title="Primary Color"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: template.colors.secondary }}
                        title="Secondary Color"
                      />
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: template.colors.accent }}
                        title="Accent Color"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Typography:</span>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm">
                        Heading: <span className="font-medium">{template.fonts.heading}</span>
                      </p>
                      <p className="text-sm">
                        Body: <span className="font-medium">{template.fonts.body}</span>
                      </p>
                    </div>
                  </div>

                  {template.layouts && (
                    <div>
                      <span className="text-sm text-muted-foreground">Available Layouts:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.layouts.map((layout) => (
                          <Badge key={layout} variant="outline" className="text-xs">
                            {layout}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => onCustomize(template)}
                  className="w-full bg-gradient-elegant hover:opacity-90 text-white"
                  size="lg"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Start Customizing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;