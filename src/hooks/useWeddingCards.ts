
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeddingCardData } from '@/types';
import { toast } from 'sonner';

export const useWeddingCards = () => {
  const [saving, setSaving] = useState(false);

  const saveCard = async (cardData: WeddingCardData) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const cardToSave = {
        bride_name: cardData.brideName,
        groom_name: cardData.groomName,
        wedding_date: cardData.weddingDate,
        venue: cardData.venue,
        message: cardData.message || '',
        template_id: cardData.templateId,
        uploaded_images: JSON.stringify(cardData.uploadedImages || []),
        logo_image: cardData.logoImage || null,
        customization: JSON.stringify(cardData.customization || {}),
        user_id: user.id,
      };

      if (cardData.id) {
        // Update existing card
        const { error } = await supabase
          .from('wedding_cards')
          .update(cardToSave)
          .eq('id', cardData.id);

        if (error) throw error;
        toast.success('Wedding card updated successfully!');
      } else {
        // Create new card
        const { error } = await supabase
          .from('wedding_cards')
          .insert(cardToSave);

        if (error) throw error;
        toast.success('Wedding card saved successfully!');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast.error('Failed to save wedding card. Please try again.');
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const loadCard = async (cardId: string): Promise<WeddingCardData | null> => {
    try {
      const { data, error } = await supabase
        .from('wedding_cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) throw error;

      // Parse JSON fields safely
      let uploadedImages: string[] = [];
      let customization = {};

      try {
        uploadedImages = data.uploaded_images ? JSON.parse(data.uploaded_images as string) : [];
      } catch (e) {
        console.warn('Failed to parse uploaded_images:', e);
        uploadedImages = Array.isArray(data.uploaded_images) ? data.uploaded_images as string[] : [];
      }

      try {
        customization = data.customization ? JSON.parse(data.customization as string) : {};
      } catch (e) {
        console.warn('Failed to parse customization:', e);
        customization = typeof data.customization === 'object' ? data.customization : {};
      }

      return {
        id: data.id,
        brideName: data.bride_name,
        groomName: data.groom_name,
        weddingDate: data.wedding_date,
        venue: data.venue,
        message: data.message || '',
        templateId: data.template_id,
        uploadedImages: uploadedImages,
        logoImage: data.logo_image || '',
        customization: customization,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error loading card:', error);
      toast.error('Failed to load wedding card');
      return null;
    }
  };

  return {
    saveCard,
    loadCard,
    saving,
  };
};
