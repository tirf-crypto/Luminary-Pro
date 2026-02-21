// ═══════════════════════════════════════════════════════════════════════════════
// UI STORE — Zustand
// Global UI state management for modals, toasts, and interface state
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { Toast, ModalState } from '../types';

interface UIState {
  // Theme
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Bottom Sheet (Mobile)
  bottomSheet: {
    isOpen: boolean;
    title: string | null;
    content: React.ReactNode | null;
  };
  openBottomSheet: (title: string, content: React.ReactNode) => void;
  closeBottomSheet: () => void;
  
  // Modal
  modal: ModalState;
  openModal: (options: Partial<ModalState>) => void;
  closeModal: () => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading States
  globalLoading: boolean;
  loadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Page Transitions
  pageTransition: 'idle' | 'entering' | 'exiting';
  setPageTransition: (state: 'idle' | 'entering' | 'exiting') => void;
  
  // Scroll Position
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
  
  // Active Section (for scroll spy)
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
}

// Generate unique toast ID
const generateToastId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useUIStore = create<UIState>()((set, get) => ({
  // Theme
  theme: 'dark',
  setTheme: (theme) => {
    set({ theme });
    
    // Apply theme to document
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    
    // Store preference
    localStorage.setItem('luminary-theme', theme);
  },

  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Bottom Sheet
  bottomSheet: {
    isOpen: false,
    title: null,
    content: null,
  },
  openBottomSheet: (title, content) => {
    set({
      bottomSheet: {
        isOpen: true,
        title,
        content,
      },
    });
  },
  closeBottomSheet: () => {
    set({
      bottomSheet: {
        isOpen: false,
        title: null,
        content: null,
      },
    });
  },

  // Modal
  modal: {
    isOpen: false,
    title: null,
    content: null,
    size: 'md',
  },
  openModal: (options) => {
    set({
      modal: {
        isOpen: true,
        title: options.title || null,
        content: options.content || null,
        size: options.size || 'md',
      },
    });
  },
  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        title: null,
        content: null,
        size: 'md',
      },
    });
  },

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = generateToastId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearToasts: () => {
    set({ toasts: [] });
  },

  // Global Loading
  globalLoading: false,
  loadingMessage: null,
  setGlobalLoading: (loading, message) => {
    set({
      globalLoading: loading,
      loadingMessage: message || null,
    });
  },

  // Page Transitions
  pageTransition: 'idle',
  setPageTransition: (state) => set({ pageTransition: state }),

  // Scroll Position
  scrollPosition: 0,
  setScrollPosition: (position) => set({ scrollPosition: position }),

  // Active Section
  activeSection: null,
  setActiveSection: (section) => set({ activeSection: section }),
}));

// Toast helper functions
export const toast = {
  success: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) => {
    useUIStore.getState().addToast({
      type: 'success',
      title,
      message: message || null,
      duration: 5000,
      action: null,
      ...options,
    });
  },
  
  error: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) => {
    useUIStore.getState().addToast({
      type: 'error',
      title,
      message: message || null,
      duration: 8000,
      action: null,
      ...options,
    });
  },
  
  warning: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) => {
    useUIStore.getState().addToast({
      type: 'warning',
      title,
      message: message || null,
      duration: 6000,
      action: null,
      ...options,
    });
  },
  
  info: (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title'>>) => {
    useUIStore.getState().addToast({
      type: 'info',
      title,
      message: message || null,
      duration: 5000,
      action: null,
      ...options,
    });
  },
};
