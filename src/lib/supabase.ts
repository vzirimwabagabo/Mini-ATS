import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or localStorage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('ats_supabase_url') || '';
  const localKey = localStorage.getItem('ats_supabase_anon_key') || '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  const isConfigured = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    url.includes('.supabase.co') &&
    key.length > 20
  );

  return { url, key, isConfigured };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance) {
    clientInstance = createClient(url, key);
  }
  return clientInstance;
};

export const updateSupabaseCredentials = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('ats_supabase_url', url.trim());
    localStorage.setItem('ats_supabase_anon_key', key.trim());
  } else {
    localStorage.removeItem('ats_supabase_url');
    localStorage.removeItem('ats_supabase_anon_key');
  }
  clientInstance = null;
};
