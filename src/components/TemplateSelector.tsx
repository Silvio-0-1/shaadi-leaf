
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check } from 'lucide-react';
import { templates } from '@/data/templates';
import { Template } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

const TemplateSelector = ({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'floral', name: 'Floral' },
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'custom', name: 'Custom' }
  ];

  useEffect(() => {
    const fetchCustomTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching custom templates:', error);
        } else {
          const formattedTemplates: Template[] = data.map(template => ({
            id: template.id,
            name: template.name,
            category: 'custom' as const,
            thumbnail: template.background_image || '/placeholder.svg',
            isPremium: template.is_premium,
            colors: template.colors as any,
            fonts: template.fonts as any,
            layouts: ['custom'],
            supportsMultiPhoto: true,
            supportsVideo: false,
            backgroundImage: template.background_image,
            defaultPositions: template.default_positions as any
          }));
          setCustomTemplates(formattedTemplates);
        }
      } catch (error) {
        console.error('Error fetching custom templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTemplates();
  }, []);

  const allTemplates = [...templates, ...customTemplates];
  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : allTemplates.filter(template => template.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
          Choose Your Template
        </h2>
        <p className="text-muted-foreground">
          Select a beautiful template to start creating your wedding card
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id}
            className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-primary ring-offset-2' 
                : ''
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
              <img 
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              
              {/* Premium Badge */}
              {template.isPremium && (
                <Badge className="absolute top-2 right-2 bg-gold-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}

              {/* Selected Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {template.category}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
