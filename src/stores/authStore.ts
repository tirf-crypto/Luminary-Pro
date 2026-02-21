// ═══════════════════════════════════════════════════════════════════════════════
// AUTH STORE — Zustand
// Production-grade authentication state management
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthState {
  // State
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, inviteCode: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  validateInviteCode: (code: string) => Promise<boolean>;
  
  // Onboarding
  completeOnboarding: (data: any) => Promise<void>;
  
  // Profile
  setUser: (user: Profile | null) => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Clear error
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Initialize auth state
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            set({
              session,
              user: profile as Profile,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              session: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
          
          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              set({
                session,
                user: profile as Profile,
                isAuthenticated: true,
              });
            } else if (event === 'SIGNED_OUT') {
              set({
                session: null,
                user: null,
                isAuthenticated: false,
              });
            }
          });
        } catch (error) {
          set({
            error: 'Failed to initialize authentication',
            isLoading: false,
          });
        }
      },

      // Sign in
      signIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          set({
            session: data.session,
            user: profile as Profile,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Sign up
      signUp: async (email, password, fullName, inviteCode) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });
          
          if (error) throw error;
          
          // Update invite code usage
          if (inviteCode && data.user) {
            await supabase.rpc('use_invite_code', {
              code: inviteCode,
              user_id: data.user.id,
            });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Validate invite code
      validateInviteCode: async (code) => {
        try {
          const { data, error } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();
          
          if (error || !data) return false;
          
          if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return false;
          }
          
          if (data.used_count >= data.max_uses) {
            return false;
          }
          
          return true;
        } catch (error) {
          return false;
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabase.auth.signOut();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Reset password
      resetPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });
          
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Update password
      updatePassword: async (password) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.updateUser({
            password,
          });
          
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Complete onboarding
      completeOnboarding: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const { user } = get();
          if (!user) throw new Error('No user found');
          
          const { error } = await supabase
            .from('profiles')
            .update({
              ...data,
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
          
          if (error) throw error;
          
          // Refresh profile
          await get().refreshProfile();
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Set user
      setUser: (user) => {
        set({ user });
      },

      // Update profile
      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const { user } = get();
          if (!user) throw new Error('No user found');
          
          const { error } = await supabase
            .from('profiles')
            .update({
              ...data,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
          
          if (error) throw error;
          
          // Update local state
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Refresh profile
      refreshProfile: async () => {
        try {
          const { session } = get();
          if (!session?.user) return;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          set({ user: profile as Profile });
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'luminary-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
