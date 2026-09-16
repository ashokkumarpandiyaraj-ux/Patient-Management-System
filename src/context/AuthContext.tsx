import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { getSupabaseClient } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role?: UserProfile['role']) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  demoLogin: (role: 'Physician' | 'Administrator' | 'Nurse') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_SESSION_KEY = 'caretrack_user_session_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const sbUser = data.session.user;
            setUser({
              id: sbUser.id,
              email: sbUser.email || 'user@caretrack.med',
              full_name: sbUser.user_metadata?.full_name || 'Medical Practitioner',
              role: (sbUser.user_metadata?.role as UserProfile['role']) || 'Physician',
            });
            setIsLoading(false);
            return;
          }
        }

        // Check local session
        const stored = localStorage.getItem(USER_SESSION_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Auth initialization warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password = ''): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const userProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserProfile['role']) || 'Physician',
          };
          setUser(userProfile);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
          return { success: true };
        }
        if (error) {
          console.warn('Supabase auth failed, checking fallback:', error.message);
        }
      }

      // Fallback local authentication
      let role: UserProfile['role'] = 'Physician';
      let name = 'Dr. Sarah Jenkins';

      if (email.toLowerCase().includes('admin')) {
        role = 'Administrator';
        name = 'Alex Morgan, Healthcare Admin';
      } else if (email.toLowerCase().includes('nurse')) {
        role = 'Nurse';
        name = 'Nurse Chloe Bennett, RN';
      } else if (email) {
        const cleanName = email.split('@')[0].replace(/[._]/g, ' ');
        name = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      }

      const userProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: name,
        role,
      };

      setUser(userProfile);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to log in';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserProfile['role'] = 'Physician'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        });

        if (!error && data.user) {
          const userProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: fullName,
            role,
          };
          setUser(userProfile);
          localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
          return { success: true };
        }
        if (error) {
          console.warn('Supabase sign up failed:', error.message);
        }
      }

      // Local sign-up
      const userProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName,
        role,
      };

      setUser(userProfile);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userProfile));
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register account';
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'Physician' | 'Administrator' | 'Nurse') => {
    setIsLoading(true);
    const demoProfiles: Record<string, UserProfile> = {
      Physician: {
        id: 'usr-demo-doctor',
        email: 'dr.jenkins@caretrack.hospital.org',
        full_name: 'Dr. Sarah Jenkins, M.D.',
        role: 'Physician',
      },
      Administrator: {
        id: 'usr-demo-admin',
        email: 'admin.morgan@caretrack.hospital.org',
        full_name: 'Alex Morgan (Hospital Admin)',
        role: 'Administrator',
      },
      Nurse: {
        id: 'usr-demo-nurse',
        email: 'nurse.chloe@caretrack.hospital.org',
        full_name: 'Chloe Bennett, BSN, RN',
        role: 'Nurse',
      },
    };

    const profile = demoProfiles[role];
    setUser(profile);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(profile));
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signout warning:', err);
    } finally {
      setUser(null);
      localStorage.removeItem(USER_SESSION_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signUp,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
