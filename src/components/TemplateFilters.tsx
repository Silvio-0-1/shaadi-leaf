import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

export interface FilterOptions {
  styles: string[];
  occasions: string[];
  formats: string[];
  regions: string[];
}

interface TemplateFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  selectedFilters: FilterOptions;
}

const filterCategories = {
  styles: [
    'Floral', 'Royal', 'Minimal', 'Traditional', 'Modern', 
    'Illustrated', 'Classic', 'Vintage', 'Geometric', 'Nordic'
  ],
  occasions: [
    'Wedding', 'Reception', 'Engagement', 'Haldi', 'Mehndi',
    'Sangeet', 'Ring Ceremony', 'Save the Date', 'Thank You'
  ],
  formats: [
    'Video', 'Voice', 'Single-page', 'Multi-page', 'Carousel',
    'Interactive', 'Animated', 'Static'
  ],
  regions: [
    'Bengali', 'South Indian', 'Muslim', 'Christian', 'Punjabi',
    'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada'
  ]
};

const TemplateFilters = ({ onFiltersChange, selectedFilters }: TemplateFiltersProps) => {
  const toggleFilter = (category: keyof FilterOptions, value: string) => {
    const currentFilters = selectedFilters[category];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(f => f !== value)
      : [...currentFilters, value];
    
    onFiltersChange({
      ...selectedFilters,
      [category]: newFilters
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      styles: [],
      occasions: [],
      formats: [],
      regions: []
    });
  };

  const getTotalFiltersCount = () => {
    return Object.values(selectedFilters).flat().length;
  };

  const renderFilterSection = (
    title: string, 
    category: keyof FilterOptions, 
    options: string[]
  ) => (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedFilters[category].includes(option);
          return (
            <Badge
              key={option}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                isSelected 
                  ? 'bg-gradient-elegant text-white shadow-glow' 
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => toggleFilter(category, option)}
            >
              {option}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="sticky top-4 bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-serif">Filters</CardTitle>
          {getTotalFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All ({getTotalFiltersCount()})
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {renderFilterSection('Style', 'styles', filterCategories.styles)}
        <Separator />
        {renderFilterSection('Occasion', 'occasions', filterCategories.occasions)}
        <Separator />
        {renderFilterSection('Format', 'formats', filterCategories.formats)}
        <Separator />
        {renderFilterSection('Region/Culture', 'regions', filterCategories.regions)}
      </CardContent>
    </Card>
  );
};

export default TemplateFilters;