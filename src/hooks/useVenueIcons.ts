import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VenueIcon, VenueIconInsert, VenueIconUpdate } from '@/types/venueIcon';
import { toast } from 'sonner';

export const useVenueIcons = () => {
  const queryClient = useQueryClient();

  const { data: venueIcons, isLoading } = useQuery({
    queryKey: ['venue-icons'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('venue_icons')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as VenueIcon[];
    },
  });

  const { data: allVenueIcons } = useQuery({
    queryKey: ['venue-icons-all'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('venue_icons')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data || []) as VenueIcon[];
    },
  });

  const createVenueIcon = useMutation({
    mutationFn: async (newIcon: VenueIconInsert) => {
      const { data, error } = await (supabase as any)
        .from('venue_icons')
        .insert([newIcon])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-icons'] });
      queryClient.invalidateQueries({ queryKey: ['venue-icons-all'] });
      toast.success('Venue icon created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create venue icon: ${error.message}`);
    },
  });

  const updateVenueIcon = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VenueIconUpdate }) => {
      const { data, error } = await (supabase as any)
        .from('venue_icons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-icons'] });
      queryClient.invalidateQueries({ queryKey: ['venue-icons-all'] });
      toast.success('Venue icon updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update venue icon: ${error.message}`);
    },
  });

  const deleteVenueIcon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('venue_icons')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-icons'] });
      queryClient.invalidateQueries({ queryKey: ['venue-icons-all'] });
      toast.success('Venue icon removed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove venue icon: ${error.message}`);
    },
  });

  return {
    venueIcons: venueIcons || [],
    allVenueIcons: allVenueIcons || [],
    isLoading,
    createVenueIcon: createVenueIcon.mutate,
    updateVenueIcon: updateVenueIcon.mutate,
    deleteVenueIcon: deleteVenueIcon.mutate,
    isCreating: createVenueIcon.isPending,
    isUpdating: updateVenueIcon.isPending,
    isDeleting: deleteVenueIcon.isPending,
  };
};
