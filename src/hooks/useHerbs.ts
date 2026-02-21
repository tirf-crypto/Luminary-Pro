import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { Herb, SavedHerb } from '@/types';

export const useHerbs = () => {
  const { user } = useAuthStore();
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [savedHerbs, setSavedHerbs] = useState<SavedHerb[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHerbs = useCallback(async (filters?: {
    category?: string;
    benefit?: string;
    search?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('herbs')
        .select('*')
        .eq('is_published', true);
      
      if (filters?.category) {
        query = query.contains('categories', [filters.category]);
      }
      
      if (filters?.benefit) {
        query = query.contains('benefits', [filters.benefit]);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query.order('name', { ascending: true });
      
      if (error) throw error;
      
      setHerbs(data as Herb[] || []);
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSavedHerbs = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_herbs')
        .select(`
          *,
          herb:herbs(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSavedHerbs(data as SavedHerb[] || []);
    } catch (err) {
      console.error('Error fetching saved herbs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const getHerbById = useCallback(async (herbId: string) => {
    try {
      const { data, error } = await supabase
        .from('herbs')
        .select('*')
        .eq('id', herbId)
        .single();
      
      if (error) throw error;
      
      return data as Herb;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      return null;
    }
  }, []);

  const saveHerb = useCallback(async (herbId: string, notes?: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_herbs')
        .insert({
          user_id: user.id,
          herb_id: herbId,
          notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSavedHerbs(prev => [...prev, data as SavedHerb]);
      toast.success('Herb saved to your collection');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const unsaveHerb = useCallback(async (savedHerbId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('saved_herbs')
        .delete()
        .eq('id', savedHerbId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setSavedHerbs(prev => prev.filter(sh => sh.id !== savedHerbId));
      toast.success('Herb removed from collection');
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id]);

  const isHerbSaved = useCallback((herbId: string) => {
    return savedHerbs.some(sh => sh.herb_id === herbId);
  }, [savedHerbs]);

  const getSavedHerbId = useCallback((herbId: string) => {
    const saved = savedHerbs.find(sh => sh.herb_id === herbId);
    return saved?.id;
  }, [savedHerbs]);

  // Categories and benefits for filtering
  const categories = useCallback(() => {
    const allCategories = herbs.flatMap(h => h.categories);
    return [...new Set(allCategories)].sort();
  }, [herbs]);

  const benefits = useCallback(() => {
    const allBenefits = herbs.flatMap(h => h.benefits);
    return [...new Set(allBenefits)].sort();
  }, [herbs]);

  return {
    herbs,
    savedHerbs,
    isLoading,
    error,
    fetchHerbs,
    fetchSavedHerbs,
    getHerbById,
    saveHerb,
    unsaveHerb,
    isHerbSaved,
    getSavedHerbId,
    categories: categories(),
    benefits: benefits(),
  };
};
