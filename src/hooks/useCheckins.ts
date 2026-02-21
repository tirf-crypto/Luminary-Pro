import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { DailyCheckin, CheckinCreate } from '@/types';

export const useCheckins = () => {
  const { user } = useAuthStore();
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckins = useCallback(async (limit = 30) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      setCheckins(data as DailyCheckin[] || []);
      
      // Find today's checkin
      const today = new Date().toISOString().split('T')[0];
      const todayData = data?.find((c: DailyCheckin) => c.date === today);
      setTodayCheckin(todayData || null);
      
      return data as DailyCheckin[];
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createCheckin = useCallback(async (checkin: CheckinCreate) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert({
          user_id: user.id,
          date: today,
          ...checkin,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTodayCheckin(data as DailyCheckin);
      
      // Update checkins list
      setCheckins(prev => {
        const filtered = prev.filter(c => c.date !== today);
        return [data as DailyCheckin, ...filtered];
      });
      
      toast.success('Daily check-in saved');
      return data as DailyCheckin;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateCheckin = useCallback(async (checkinId: string, updates: Partial<DailyCheckin>) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', checkinId)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setCheckins(prev => 
        prev.map(c => c.id === checkinId ? data as DailyCheckin : c)
      );
      
      if (todayCheckin?.id === checkinId) {
        setTodayCheckin(data as DailyCheckin);
      }
      
      toast.success('Check-in updated');
      return data as DailyCheckin;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, todayCheckin]);

  const getStreak = useCallback(async () => {
    if (!user?.id) return 0;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_streak', { user_uuid: user.id });
      
      if (error) throw error;
      return data || 0;
    } catch (err) {
      console.error('Error getting streak:', err);
      return 0;
    }
  }, [user?.id]);

  const getWeeklyStats = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('get_weekly_checkin_stats', { user_uuid: user.id });
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting weekly stats:', err);
      return null;
    }
  }, [user?.id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('checkins-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_checkins',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCheckins(prev => [payload.new as DailyCheckin, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCheckins(prev =>
              prev.map(c => c.id === payload.new.id ? payload.new as DailyCheckin : c)
            );
          } else if (payload.eventType === 'DELETE') {
            setCheckins(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    checkins,
    todayCheckin,
    isLoading,
    error,
    fetchCheckins,
    createCheckin,
    updateCheckin,
    getStreak,
    getWeeklyStats,
  };
};
