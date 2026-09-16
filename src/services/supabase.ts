import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from import.meta.env or localStorage (allows evaluator to configure directly in UI)
const getStoredCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('caretrack_supabase_url') || '';
  const localKey = localStorage.getItem('caretrack_supabase_anon_key') || '';

  const finalUrl = (localUrl && localUrl.startsWith('http')) ? localUrl : (envUrl && envUrl.startsWith('http') ? envUrl : '');
  const finalKey = localKey || envKey || '';

  return { url: finalUrl, key: finalKey };
};

let currentClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getStoredCredentials();

  // If credentials haven't changed and client exists, reuse
  if (currentClient && currentUrl === url && currentKey === key) {
    return currentClient;
  }

  // If valid credentials exist, create client
  if (url && key && url.startsWith('http') && !url.includes('your-project.supabase.co')) {
    try {
      currentClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      currentUrl = url;
      currentKey = key;
      return currentClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getStoredCredentials();
  return Boolean(url && key && url.startsWith('http') && !url.includes('your-project.supabase.co'));
};

export const getSupabaseConfig = () => {
  return getStoredCredentials();
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('caretrack_supabase_url', url.trim());
  localStorage.setItem('caretrack_supabase_anon_key', key.trim());
  currentClient = null; // force recreation on next call
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('caretrack_supabase_url');
  localStorage.removeItem('caretrack_supabase_anon_key');
  currentClient = null;
};

export const testConnection = async (url?: string, key?: string): Promise<{ success: boolean; message: string; tableFound?: boolean }> => {
  try {
    const testUrl = url || getStoredCredentials().url;
    const testKey = key || getStoredCredentials().key;

    if (!testUrl || !testKey) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }

    const testClient = createClient(testUrl, testKey);
    // Attempt a light query on the patients table
    const { data, error } = await testClient.from('patients').select('id').limit(1);

    if (error) {
      // Check if table missing
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          tableFound: false,
          message: 'Connected to Supabase project successfully, but "patients" table is not created yet. Please execute the provided SQL script in your Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }

    return {
      success: true,
      tableFound: true,
      message: `Successfully connected to Supabase! Found ${data?.length ?? 0} record(s) in patients table.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    return { success: false, message };
  }
};
