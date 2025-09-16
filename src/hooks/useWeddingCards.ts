
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeddingCardData } from '@/types';
import { toast } from 'sonner';
import { validateFormData, validateName, validateVenue, validateMessage, validateWeddingDate } from '@/lib/security';

export const useWeddingCards = () => {
  const [saving, setSaving] = useState(false);

  const saveCard = async (cardData: WeddingCardData) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // SECURITY FIX: Enhanced validation with sanitization
      const brideValidation = validateName(cardData.brideName || '');
      if (!brideValidation.isValid) {
        toast.error(brideValidation.error);
        return { success: false, error: brideValidation.error };
      }

      const groomValidation = validateName(cardData.groomName || '');
      if (!groomValidation.isValid) {
        toast.error(groomValidation.error);
        return { success: false, error: groomValidation.error };
      }

      const venueValidation = validateVenue(cardData.venue || '');
      if (!venueValidation.isValid) {
        toast.error(venueValidation.error);
        return { success: false, error: venueValidation.error };
      }

      const dateValidation = validateWeddingDate(cardData.weddingDate || '');
      if (!dateValidation.isValid) {
        toast.error(dateValidation.error);
        return { success: false, error: dateValidation.error };
      }

      if (cardData.message) {
        const messageValidation = validateMessage(cardData.message);
        if (!messageValidation.isValid) {
          toast.error(messageValidation.error);
          return { success: false, error: messageValidation.error };
        }
      }

      // Use sanitized values from validation
      const cardToSave = {
        bride_name: brideValidation.sanitized,
        groom_name: groomValidation.sanitized,
        wedding_date: cardData.weddingDate,
        venue: venueValidation.sanitized,
        message: cardData.message ? validateMessage(cardData.message).sanitized : '',
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
