import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { Profile, ProfileUpdate } from '@/types';

export const useProfile = () => {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setUser(data as Profile);
      return data as Profile;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setUser]);

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setUser(data as Profile);
      toast.success('Profile updated successfully');
      return data as Profile;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setUser]);

  const updateAvatar = useCallback(async (file: File) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Update profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setUser(data as Profile);
      toast.success('Avatar updated successfully');
      return data as Profile;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, setUser]);

  const updateSettings = useCallback(async (settings: Partial<Profile['settings']>) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const currentSettings = user.settings || {};
      const newSettings = { ...currentSettings, ...settings };
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          settings: newSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setUser(data as Profile);
      toast.success('Settings updated successfully');
      return data as Profile;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser]);

  return {
    profile: user,
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    updateAvatar,
    updateSettings,
  };
};
