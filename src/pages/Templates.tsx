import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import VisualTemplateBuilder from '@/components/VisualTemplateBuilder';
import PremiumTemplateCard from '@/components/PremiumTemplateCard';
import TemplateFilters, { FilterOptions } from '@/components/TemplateFilters';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import FeaturedTemplatesCarousel from '@/components/FeaturedTemplatesCarousel';
import { useUserRole } from '@/hooks/useUserRole';
import { Template } from '@/types';
import { templates } from '@/data/templates';
import { supabase } from '@/integrations/supabase/client';

const Templates = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [showCreator, setShowCreator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<FilterOptions>({
    styles: [],
    occasions: [],
    formats: [],
    regions: []
  });

  useEffect(() => {
    fetchCustomTemplates();
    loadFavorites();
  }, []);

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

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('templateFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/customize?template=${templateId}`);
  };

  const handleTemplateCreated = (template: Template) => {
    setShowCreator(false);
    fetchCustomTemplates();
    handleTemplateSelect(template.id);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleCustomize = (template: Template) => {
    setPreviewTemplate(null);
    handleTemplateSelect(template.id);
  };

  const handleFavorite = (templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    setFavorites(newFavorites);
    localStorage.setItem('templateFavorites', JSON.stringify(newFavorites));
  };

  const handleEdit = (template: Template) => {
    // TODO: Implement edit functionality
    console.log('Edit template:', template);
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
      } else {
        fetchCustomTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Combine and filter templates
  const allTemplates = [...templates, ...customTemplates];
  
  const filteredTemplates = allTemplates.filter(template => {
    // Search filter
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Style filter
    if (filters.styles.length > 0) {
      const templateStyle = template.category.charAt(0).toUpperCase() + template.category.slice(1);
      if (!filters.styles.some(style => style.toLowerCase() === template.category || style === templateStyle)) {
        return false;
      }
    }
    
    // Format filter
    if (filters.formats.length > 0) {
      let hasMatchingFormat = false;
      if (filters.formats.includes('Video') && template.supportsVideo) hasMatchingFormat = true;
      if (filters.formats.includes('Multi-page') && template.supportsMultiPhoto) hasMatchingFormat = true;
      if (filters.formats.includes('Single-page') && !template.supportsMultiPhoto) hasMatchingFormat = true;
      if (!hasMatchingFormat && filters.formats.length > 0) return false;
    }
    
    return true;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return b.id.localeCompare(a.id); // Assuming newer templates have lexicographically larger IDs
      case 'premium':
        return b.isPremium ? 1 : -1;
      default: // popular
        return b.isPremium ? 1 : -1; // Premium templates first for "popular"
    }
  });

  if (showCreator) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowCreator(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
          </div>
          <VisualTemplateBuilder onTemplateCreated={handleTemplateCreated} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-background/90 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
              Beautiful Wedding Templates
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our curated collection of premium wedding invitation templates. 
              Each design is crafted with love and attention to detail.
            </p>
          </div>
          
          {/* Featured Templates Carousel */}
          <FeaturedTemplatesCarousel 
            templates={allTemplates.filter(t => t.isPremium)}
            onTemplateSelect={(template) => handleCustomize(template)}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            {isAdmin && !roleLoading && (
              <Button
                onClick={() => setShowCreator(true)}
                className="bg-gradient-elegant hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Template
              </Button>
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="premium">Premium First</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <TemplateFilters
              selectedFilters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {sortedTemplates.length} of {allTemplates.length} templates
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Toggle Filters
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTemplates.map((template) => (
                  <PremiumTemplateCard
                    key={template.id}
                    template={template}
                    onPreview={handlePreview}
                    onCustomize={handleCustomize}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(template.id)}
                  />
                ))}
              </div>
            )}

            {sortedTemplates.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No templates found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ styles: [], occasions: [], formats: [], regions: [] });
                  }}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onCustomize={handleCustomize}
      />
    </div>
  );
};

export default Templates;
