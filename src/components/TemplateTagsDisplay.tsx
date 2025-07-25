import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TemplateTagsDisplayProps {
  tags: string[];
  className?: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export const TemplateTagsDisplay = ({ tags, className = "" }: TemplateTagsDisplayProps) => {
  const [tagData, setTagData] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTagData = async () => {
      if (!tags || tags.length === 0) return;

      const { data, error } = await supabase
        .from('template_tags')
        .select('*')
        .in('name', tags);

      if (error) {
        console.error('Error fetching tag data:', error);
      } else {
        setTagData(data || []);
      }
    };

    fetchTagData();
  }, [tags]);

  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tagName) => {
        const tag = tagData.find(t => t.name === tagName);
        return (
          <Badge 
            key={tagName}
            variant="secondary"
            className="text-xs flex items-center space-x-1"
            style={tag ? { backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color } : undefined}
          >
            {tag && (
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: tag.color }}
              />
            )}
            <span>{tagName}</span>
          </Badge>
        );
      })}
    </div>
  );
};