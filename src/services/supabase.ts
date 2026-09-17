import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;

export const getSupabaseClient = (): SupabaseClient | null => supabase;

export const isSupabaseConfigured = (): boolean => Boolean(supabase);

export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  key: supabaseKey,
});

export const testConnection = async (): Promise<{ success: boolean; message: string; tableFound?: boolean }> => {
  if (!supabase) {
    return { success: false, message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.' };
  }

  try {
    const { data, error } = await supabase.from('patients').select('id').limit(1);

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          tableFound: false,
          message: 'Connected to Supabase project successfully, but the "patients" table is not created yet. Please run the provided SQL schema in your Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Connection error: ${error.message}` };
    }

    return {
      success: true,
      tableFound: true,
      message: `Successfully connected to Supabase! Found ${data?.length ?? 0} record(s) in the patients table.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown connection error';
    return { success: false, message };
  }
};
