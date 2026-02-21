import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'luminary-auth-token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Realtime subscription helpers
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: filter || undefined,
      },
      callback
    )
    .subscribe();

  return channel;
};

// Storage helpers
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) throw error;
  return data;
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// RPC helpers
export const callRPC = async <T = any>(
  functionName: string,
  params?: Record<string, any>
) => {
  const { data, error } = await supabase.rpc(functionName, params);
  if (error) throw error;
  return data as T;
};

// Error handler
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    // Common error messages
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (error.message.includes('Invalid invite code')) {
      return 'The invite code is invalid or has expired.';
    }
    if (error.message.includes('row-level security')) {
      return 'You do not have permission to perform this action.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
