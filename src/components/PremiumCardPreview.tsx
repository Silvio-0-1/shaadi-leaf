import React from 'react';
import { Card } from '@/components/ui/card';
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
  return (
    <div className={cn("w-full h-full flex items-center justify-center", className)}>
      {/* Card Container - Responsive Sizing */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-[400px] aspect-[2/3] overflow-hidden shadow-2xl bg-card relative transition-all duration-300">
          {/* Grid Overlay */}
          {showGrid && !isPreviewMode && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <svg className="w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}

          {/* Enhanced Card Editor */}
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

          {/* Guides - Center Lines */}
          {showGuides && !isPreviewMode && (
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30 pointer-events-none z-10 transition-opacity duration-200" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/30 pointer-events-none z-10 transition-opacity duration-200" />
            </>
          )}
        </Card>
      </div>
    </div>
  );
};