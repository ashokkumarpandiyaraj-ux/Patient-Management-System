import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '../types';
import { getSupabaseClient } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: UserProfile['role']) => Promise<{ success: boolean; error?: string; confirmationRequired?: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const configError = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.';

const profileFromAuthUser = (user: { id: string; email?: string; user_metadata: Record<string, unknown> }): UserProfile => ({
  id: user.id,
  email: user.email || '',
  full_name: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : user.email || 'Medical Practitioner',
  role: (user.user_metadata.role as UserProfile['role']) || 'Physician',
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initialize = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.warn('Unable to restore Supabase session:', error.message);
      setUser(data.session?.user ? profileFromAuthUser(data.session.user) : null);
      setIsLoading(false);
    };

    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? profileFromAuthUser(session.user) : null);
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: configError };
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Supabase did not return an authenticated user.' };
      setUser(profileFromAuthUser(data.user));
      return { success: true, confirmationRequired: !data.session };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserProfile['role'] = 'Physician') => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: configError };
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, role } },
      });
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Supabase did not create an account.' };
      if (data.session) setUser(profileFromAuthUser(data.user));
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    }
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, signUp, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
