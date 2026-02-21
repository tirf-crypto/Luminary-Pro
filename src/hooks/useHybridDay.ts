import { useState, useEffect, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { HybridDayPlan, DayBlock, Habit, HabitCompletion } from '@/types';

export const useHybridDay = () => {
  const { user } = useAuthStore();
  const [todayPlan, setTodayPlan] = useState<HybridDayPlan | null>(null);
  const [blocks, setBlocks] = useState<DayBlock[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayPlan = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's plan
      const { data: planData, error: planError } = await supabase
        .from('hybrid_day_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();
      
      if (planError && planError.code !== 'PGRST116') throw planError;
      
      if (planData) {
        setTodayPlan(planData as HybridDayPlan);
        
        // Fetch blocks for this plan
        const { data: blocksData, error: blocksError } = await supabase
          .from('day_blocks')
          .select('*')
          .eq('plan_id', planData.id)
          .order('start_time', { ascending: true });
        
        if (blocksError) throw blocksError;
        setBlocks(blocksData as DayBlock[] || []);
      } else {
        // Generate default plan
        await generateDefaultPlan();
      }
      
      // Fetch habits
      await fetchHabits();
      
      // Fetch today's habit completions
      await fetchHabitCompletions();
      
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const generateDefaultPlan = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const wakeTime = user.wake_time || '06:00';
      const workStart = user.work_start || '09:00';
      const workEnd = user.work_end || '17:00';
      
      // Parse times
      const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
      const [workStartHour, workStartMin] = workStart.split(':').map(Number);
      const [workEndHour, workEndMin] = workEnd.split(':').map(Number);
      
      // Create default blocks
      const defaultBlocks = [
        {
          name: 'Morning Routine',
          start_time: wakeTime,
          end_time: `${String(wakeHour + 1).padStart(2, '0')}:${String(wakeMin).padStart(2, '0')}`,
          type: 'morning_routine',
          color: 'amber',
          activities: ['Meditation', 'Hydration', 'Movement'],
        },
        {
          name: 'Deep Work',
          start_time: workStart,
          end_time: `${String(workStartHour + 3).padStart(2, '0')}:${String(workStartMin).padStart(2, '0')}`,
          type: 'deep_work',
          color: 'violet',
          activities: ['Focus session', 'Priority tasks'],
        },
        {
          name: 'Break',
          start_time: `${String(workStartHour + 3).padStart(2, '0')}:${String(workStartMin).padStart(2, '0')}`,
          end_time: `${String(workStartHour + 4).padStart(2, '0')}:${String(workStartMin).padStart(2, '0')}`,
          type: 'break',
          color: 'sky',
          activities: ['Walk', 'Stretch', 'Snack'],
        },
        {
          name: 'Afternoon Work',
          start_time: `${String(workStartHour + 4).padStart(2, '0')}:${String(workStartMin).padStart(2, '0')}`,
          end_time: workEnd,
          type: 'deep_work',
          color: 'violet',
          activities: ['Meetings', 'Collaboration'],
        },
        {
          name: 'Evening Routine',
          start_time: `${String(workEndHour + 1).padStart(2, '0')}:${String(workEndMin).padStart(2, '0')}`,
          end_time: `${String(workEndHour + 3).padStart(2, '0')}:${String(workEndMin).padStart(2, '0')}`,
          type: 'evening_routine',
          color: 'indigo',
          activities: ['Reflection', 'Reading', 'Rest'],
        },
      ];
      
      // Create plan
      const { data: planData, error: planError } = await supabase
        .from('hybrid_day_plans')
        .insert({
          user_id: user.id,
          date: today,
          word: 'Focus',
          completion_percentage: 0,
        })
        .select()
        .single();
      
      if (planError) throw planError;
      
      setTodayPlan(planData as HybridDayPlan);
      
      // Create blocks
      const blocksWithPlanId = defaultBlocks.map(block => ({
        ...block,
        plan_id: planData.id,
      }));
      
      const { data: blocksData, error: blocksError } = await supabase
        .from('day_blocks')
        .insert(blocksWithPlanId)
        .select();
      
      if (blocksError) throw blocksError;
      
      setBlocks(blocksData as DayBlock[] || []);
      
    } catch (err) {
      console.error('Error generating default plan:', err);
    }
  }, [user]);

  const fetchHabits = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setHabits(data as Habit[] || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
    }
  }, [user?.id]);

  const fetchHabitCompletions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);
      
      if (error) throw error;
      
      setHabitCompletions(data as HabitCompletion[] || []);
    } catch (err) {
      console.error('Error fetching habit completions:', err);
    }
  }, [user?.id]);

  const createHabit = useCallback(async (habit: Partial<Habit>) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          ...habit,
          streak: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setHabits(prev => [...prev, data as Habit]);
      toast.success('Habit created');
      return data as Habit;
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    if (!user?.id) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingCompletion = habitCompletions.find(
        c => c.habit_id === habitId && c.date === today
      );
      
      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existingCompletion.id);
        
        if (error) throw error;
        
        setHabitCompletions(prev => 
          prev.filter(c => c.id !== existingCompletion.id)
        );
      } else {
        // Add completion
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            date: today,
            completed: true,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setHabitCompletions(prev => [...prev, data as HabitCompletion]);
      }
    } catch (err) {
      const message = handleSupabaseError(err);
      toast.error(message);
    }
  }, [user?.id, habitCompletions]);

  const updatePlanWord = useCallback(async (word: string) => {
    if (!user?.id || !todayPlan) return;
    
    try {
      const { data, error } = await supabase
        .from('hybrid_day_plans')
        .update({ word })
        .eq('id', todayPlan.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setTodayPlan(data as HybridDayPlan);
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id, todayPlan]);

  const updateBlockCompletion = useCallback(async (blockId: string, completion: number) => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('day_blocks')
        .update({ completion_percentage: completion })
        .eq('id', blockId)
        .select()
        .single();
      
      if (error) throw error;
      
      setBlocks(prev =>
        prev.map(b => b.id === blockId ? data as DayBlock : b)
      );
    } catch (err) {
      toast.error(handleSupabaseError(err));
    }
  }, [user?.id]);

  return {
    todayPlan,
    blocks,
    habits,
    habitCompletions,
    isLoading,
    error,
    fetchTodayPlan,
    generateDefaultPlan,
    createHabit,
    toggleHabitCompletion,
    updatePlanWord,
    updateBlockCompletion,
    isHabitCompleted: (habitId: string) => 
      habitCompletions.some(c => c.habit_id === habitId),
  };
};
