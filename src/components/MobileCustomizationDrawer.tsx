import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Image, 
  Type, 
  Palette, 
  Info,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { WeddingCardData } from '@/types';
import BasicInfoForm from './BasicInfoForm';
import MultiPhotoUpload from './MultiPhotoUpload';
import LogoUpload from './LogoUpload';
import PremiumFontEditor from './PremiumFontEditor';
import TextColorEditor from './TextColorEditor';

interface MobileCustomizationDrawerProps {
  cardData: WeddingCardData;
  onDataChange: (data: Partial<WeddingCardData>) => void;
  children: React.ReactNode;
}

export const MobileCustomizationDrawer: React.FC<MobileCustomizationDrawerProps> = ({
  cardData,
  onDataChange,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const tabConfig = [
    { 
      id: 'basic', 
      label: 'Details', 
      icon: Info,
      description: 'Names, date & venue'
    },
    { 
      id: 'photos', 
      label: 'Photos', 
      icon: Image,
      description: 'Add your pictures'
    },
    { 
      id: 'fonts', 
      label: 'Fonts', 
      icon: Type,
      description: 'Typography settings'
    },
    { 
      id: 'colors', 
      label: 'Colors', 
      icon: Palette,
      description: 'Text colors'
    }
  ];

  const handleImageUpload = (imageUrl: string) => {
    onDataChange({ uploadedImage: imageUrl });
  };

  const handlePhotoShapeChange = (shape: 'square' | 'circle' | 'rounded') => {
    onDataChange({
      customization: {
        ...cardData.customization,
        photoShape: shape
      }
    });
  };

  const handleLogoUpload = (logoUrl: string) => {
    onDataChange({ logoImage: logoUrl });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0 pb-0">
          <DrawerTitle className="flex items-center justify-between">
            <span className="font-premium-serif text-lg">Customize Your Card</span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex-shrink-0 px-4 pb-2">
              <div className="grid grid-cols-4 gap-1 bg-muted/30 p-1 rounded-lg">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center p-2 rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-background shadow-sm ring-1 ring-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 mb-1 ${
                      activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <span className={`text-xs font-medium ${
                      activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <TabsContent value="basic" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Wedding Details</h3>
                  <p className="text-sm text-muted-foreground">Enter your wedding information</p>
                </div>
                <BasicInfoForm cardData={cardData} onDataChange={onDataChange} />
              </TabsContent>

              <TabsContent value="photos" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Photo Gallery</h3>
                  <p className="text-sm text-muted-foreground">Upload and customize your photos</p>
                </div>
                <div className="space-y-4">
                  <MultiPhotoUpload
                    images={cardData.uploadedImages || []}
                    onImagesChange={(images) => onDataChange({ uploadedImages: images })}
                    photoShape={cardData.customization?.photoShape || 'rounded'}
                    onPhotoShapeChange={handlePhotoShapeChange}
                  />
                  <LogoUpload
                    logo={cardData.logoImage}
                    onLogoChange={handleLogoUpload}
                  />
                </div>
              </TabsContent>

              <TabsContent value="fonts" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Typography</h3>
                  <p className="text-sm text-muted-foreground">Choose fonts and sizes</p>
                </div>
                <PremiumFontEditor
                  customization={cardData.customization || {}}
                  onCustomizationChange={(customization) => 
                    onDataChange({ customization })
                  }
                  templateId={cardData.templateId}
                />
              </TabsContent>

              <TabsContent value="colors" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Color Palette</h3>
                  <p className="text-sm text-muted-foreground">Customize text colors</p>
                </div>
                <TextColorEditor
                  customization={cardData.customization || {}}
                  onCustomizationChange={(customization) => 
                    onDataChange({ customization })
                  }
                  templateId={cardData.templateId}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};