import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { Place, SavedPlace, PlaceReview } from '@/types';

interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  type?: string;
}

export const usePlaces = () => {
  const { user } = useAuthStore();
  const [places, setPlaces] = useState<Place[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search nearby places using Google Places API via edge function
  const searchNearby = useCallback(async (params: NearbySearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('places-search', {
        body: params,
      });
      
      if (error) throw error;
      
      setPlaces(data.places || []);
      return data.places as Place[];
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search places by text
  const searchByText = useCallback(async (query: string, location?: { lat: number; lng: number }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('places-search', {
        body: {
          query,
          location,
        },
      });
      
      if (error) throw error;
      
      setPlaces(data.places || []);
      return data.places as Place[];
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('places-details', {
        body: { placeId },
      });
      
      if (error) throw error;
      
      return data.place as Place;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      return null;
    }
  }, []);

  // Fetch user's saved places
  const fetchSavedPlaces = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .select(`
          *,
          place:places(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSavedPlaces(data as SavedPlace[] || []);
    } catch (err) {
      console.error('Error fetching saved places:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save a place
  const savePlace = useCallback(async (placeData: Partial<Place>, notes?: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // First, save or get the place
      const { data: placeResult, error: placeError } = await supabase
        .from('places')
        .upsert({
          ...placeData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'google_place_id',
        })
        .select()
        .single();
      
      if (placeError) throw placeError;
      
      // Then save it for the user
      const { data: savedPlace, error: saveError } = await supabase
        .from('saved_places')
        .insert({
          user_id: user.id,
          place_id: placeResult.id,
          notes,
        })
        .select()
        .single();
      
      if (saveError) throw saveError;
      
      setSavedPlaces(prev => [...prev, { ...savedPlace, place: placeResult }]);
      toast.success('Place saved to your favorites');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Unsave a place
  const unsavePlace = useCallback(async (savedPlaceId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('saved_places')
        .delete()
        .eq('id', savedPlaceId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSavedPlaces(prev => prev.filter(sp => sp.id !== savedPlaceId));
      toast.success('Place removed from favorites');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id]);

  // Add a review
  const addReview = useCallback(async (placeId: string, rating: number, content: string) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('place_reviews')
        .insert({
          place_id: placeId,
          user_id: user.id,
          rating,
          content,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Review added');
      return data as PlaceReview;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    }
  }, [user?.id]);

  // Get place reviews
  const getPlaceReviews = useCallback(async (placeId: string) => {
    try {
      const { data, error } = await supabase
        .from('place_reviews')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('place_id', placeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as PlaceReview[];
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    }
  }, []);

  const isPlaceSaved = useCallback((placeId: string) => {
    return savedPlaces.some(sp => sp.place_id === placeId);
  }, [savedPlaces]);

  return {
    places,
    savedPlaces,
    isLoading,
    error,
    searchNearby,
    searchByText,
    getPlaceDetails,
    fetchSavedPlaces,
    savePlace,
    unsavePlace,
    addReview,
    getPlaceReviews,
    isPlaceSaved,
  };
};
