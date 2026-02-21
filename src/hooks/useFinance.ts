import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import type { 
  IncomeEntry, 
  SavingsGoal, 
  SavingsEntry, 
  SpendingCategory, 
  SpendingEntry,
  FinanceSummary 
} from '@/types';

export const useFinance = () => {
  const { user } = useAuthStore();
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsEntries, setSavingsEntries] = useState<SavingsEntry[]>([]);
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const [spendingEntries, setSpendingEntries] = useState<SpendingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all finance data
  const fetchFinanceData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch income entries
      const { data: incomeData, error: incomeError } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (incomeError) throw incomeError;
      setIncomeEntries(incomeData as IncomeEntry[] || []);
      
      // Fetch savings goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (goalsError) throw goalsError;
      setSavingsGoals(goalsData as SavingsGoal[] || []);
      
      // Fetch savings entries
      const { data: savingsData, error: savingsError } = await supabase
        .from('savings_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (savingsError) throw savingsError;
      setSavingsEntries(savingsData as SavingsEntry[] || []);
      
      // Fetch spending categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('spending_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      setSpendingCategories(categoriesData as SpendingCategory[] || []);
      
      // Fetch spending entries
      const { data: spendingData, error: spendingError } = await supabase
        .from('spending_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(100);
      
      if (spendingError) throw spendingError;
      setSpendingEntries(spendingData as SpendingEntry[] || []);
      
    } catch (err) {
      const message = handleSupabaseError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Computed summary
  const summary: FinanceSummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Monthly income
    const monthlyIncome = incomeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Monthly spending
    const monthlySpending = spendingEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Monthly savings
    const monthlySavings = savingsEntries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    // Total saved
    const totalSaved = savingsEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    // Total goals target
    const totalGoalsTarget = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
    
    // Spending by category
    const spendingByCategory = spendingCategories.map(category => {
      const categorySpending = spendingEntries
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entry.category_id === category.id &&
                 entryDate.getMonth() === currentMonth && 
                 entryDate.getFullYear() === currentYear;
        })
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      return {
        category,
        spent: categorySpending,
        budget: category.monthly_budget,
        percentage: category.monthly_budget > 0 
          ? (categorySpending / category.monthly_budget) * 100 
          : 0,
      };
    });
    
    return {
      monthlyIncome,
      monthlySpending,
      monthlySavings,
      totalSaved,
      totalGoalsTarget,
      spendingByCategory,
      availableToSpend: monthlyIncome - monthlySpending - monthlySavings,
      savingsRate: monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0,
    };
  }, [incomeEntries, spendingEntries, savingsEntries, savingsGoals, spendingCategories]);

  // Income operations
  const addIncome = useCallback(async (amount: number, source: string, date?: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('income_entries')
        .insert({
          user_id: user.id,
          amount,
          source,
          date: date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setIncomeEntries(prev => [data as IncomeEntry, ...prev]);
      toast.success('Income added');
      return data as IncomeEntry;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Savings goal operations
  const createSavingsGoal = useCallback(async (goal: Partial<SavingsGoal>) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: user.id,
          ...goal,
          current_amount: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSavingsGoals(prev => [...prev, data as SavingsGoal]);
      toast.success('Savings goal created');
      return data as SavingsGoal;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const addToSavings = useCallback(async (goalId: string, amount: number) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Add savings entry
      const { data: entryData, error: entryError } = await supabase
        .from('savings_entries')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          amount,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (entryError) throw entryError;
      
      setSavingsEntries(prev => [entryData as SavingsEntry, ...prev]);
      
      // Update goal current amount
      const goal = savingsGoals.find(g => g.id === goalId);
      if (goal) {
        const { data: updatedGoal, error: goalError } = await supabase
          .from('savings_goals')
          .update({ current_amount: goal.current_amount + amount })
          .eq('id', goalId)
          .select()
          .single();
        
        if (goalError) throw goalError;
        
        setSavingsGoals(prev =>
          prev.map(g => g.id === goalId ? updatedGoal as SavingsGoal : g)
        );
      }
      
      toast.success(`$${amount.toFixed(2)} added to savings`);
      return entryData as SavingsEntry;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, savingsGoals]);

  // Spending operations
  const createSpendingCategory = useCallback(async (category: Partial<SpendingCategory>) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('spending_categories')
        .insert({
          user_id: user.id,
          ...category,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSpendingCategories(prev => [...prev, data as SpendingCategory]);
      toast.success('Category created');
      return data as SpendingCategory;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const addSpending = useCallback(async (categoryId: string, amount: number, description: string) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('spending_entries')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          amount,
          description,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setSpendingEntries(prev => [data as SpendingEntry, ...prev]);
      toast.success('Expense added');
      return data as SpendingEntry;
    } catch (err) {
      toast.error(handleSupabaseError(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    incomeEntries,
    savingsGoals,
    savingsEntries,
    spendingCategories,
    spendingEntries,
    summary,
    isLoading,
    error,
    fetchFinanceData,
    addIncome,
    createSavingsGoal,
    addToSavings,
    createSpendingCategory,
    addSpending,
  };
};
