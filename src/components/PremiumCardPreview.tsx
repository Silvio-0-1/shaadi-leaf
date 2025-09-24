import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { WeddingCardData } from '@/types';
import EnhancedCardEditor from './EnhancedCardEditor';
import { cn } from '@/lib/utils';

interface PremiumCardPreviewProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
  isPreviewMode: boolean;
  showGrid?: boolean;
  showGuides?: boolean;
  className?: string;
}

export const PremiumCardPreview: React.FC<PremiumCardPreviewProps> = ({
  cardData,
  onDataChange,
  isPreviewMode,
  showGrid = false,
  showGuides = false,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-full flex flex-col bg-gradient-to-br from-lavender-50 to-lavender-100 rounded-xl border golden-border overflow-hidden",
        className
      )}
    >
      {/* Preview Mode Header */}
      <div className="flex-shrink-0 p-4 bg-background/50 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isPreviewMode ? "default" : "secondary"} 
              className="flex items-center gap-1"
            >
              {isPreviewMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {isPreviewMode ? 'Preview Mode' : 'Design Mode'}
            </Badge>
            {showGrid && (
              <Badge variant="outline" className="text-xs">Grid On</Badge>
            )}
            {showGuides && (
              <Badge variant="outline" className="text-xs">Guides On</Badge>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Live Preview • {Math.round(containerSize.width)}×{Math.round(containerSize.height)}
          </div>
        </div>
      </div>

      {/* Card Preview Area */}
      <div className="flex-1 relative p-6">
        <div className="h-full flex items-center justify-center">
          <div className="relative">
            {/* Decorative Elements */}
            {!isPreviewMode && (
              <>
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-gold-200 to-gold-300 rounded-full opacity-20 animate-floating-sparkles" />
                <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-gradient-to-br from-lavender-200 to-lavender-300 rounded-full opacity-30 animate-floating-sparkles" style={{ animationDelay: '1s' }} />
                <div className="absolute -top-3 -right-8 w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-full opacity-25 animate-floating-sparkles" style={{ animationDelay: '2s' }} />
              </>
            )}
            
            {/* Main Card */}
            <Card className="w-[400px] h-[600px] overflow-hidden elegant-shadow bg-background">
              <EnhancedCardEditor
                cardData={cardData}
                onDataChange={onDataChange}
                initialPositions={{
                  brideName: { x: 0, y: -60 },
                  groomName: { x: 0, y: -20 },
                  heartIcon: { x: 0, y: 20 },
                  weddingDate: { x: 0, y: 60 },
                  venue: { x: 0, y: 100 },
                  message: { x: 0, y: 140 },
                  photo: { 
                    position: { x: 0, y: -140 },
                    size: { width: 120, height: 120 }
                  },
                  photos: [],
                  logo: { x: 0, y: -180 },
                }}
                onPositionsUpdate={() => {}}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-4 right-4 glassmorphism rounded-lg px-2 py-1">
        <span className="text-xs text-muted-foreground font-mono">1:1</span>
      </div>
    </div>
  );
};