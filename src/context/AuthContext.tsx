import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { createAccountAsAdmin, createNewAccount, fetchAllProfiles, getStoredProfiles, initLocalStorageIfEmpty, setAccountActiveAsAdmin, updateAccountAsAdmin } from '../lib/storage';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  effectiveUser: UserProfile | null;
  impersonatedCustomer: UserProfile | null;
  allProfiles: UserProfile[];
  isSupabaseConfigured: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setImpersonatedCustomer: (customer: UserProfile | null) => void;
  createAccount: (email: string, password: string, fullName: string, role: UserRole, companyName?: string) => Promise<UserProfile>;
  updateAccount: (userId: string, fullName: string, role: UserRole, companyName?: string) => Promise<UserProfile>;
  setAccountActive: (userId: string, isActive: boolean) => Promise<UserProfile>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfiles: () => Promise<void>;
  switchUserRoleDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'mini_ats_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [impersonatedCustomer, setImpersonatedCustomer] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);

  useEffect(() => {
    const { isConfigured } = getSupabaseConfig();
    setIsSupabaseConfigured(isConfigured);

    const initAuth = async () => {
      try {
        if (!isConfigured && import.meta.env.DEV) {
          initLocalStorageIfEmpty();
          const storedUser = localStorage.getItem(AUTH_USER_KEY);
          if (storedUser) {
            try {
              setCurrentUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem(AUTH_USER_KEY);
            }
          }

          const profiles = await fetchAllProfiles();
          setAllProfiles(profiles);

          if (!storedUser) {
            const defaultAdmin = profiles.find(p => p.role === 'admin') || profiles[0];
            if (defaultAdmin) {
              setCurrentUser(defaultAdmin);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultAdmin));
            }
          }
          return;
        }

        if (!isConfigured) return;

        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            if (profile) {
              const u: UserProfile = {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                isActive: profile.is_active ?? true,
                fullName: profile.full_name,
                companyName: profile.company_name,
                createdAt: profile.created_at
              };
              setCurrentUser(u);
              const profiles = await fetchAllProfiles();
              setAllProfiles(profiles);
            } else {
              await supabase.auth.signOut();
            }
          }
        }
      } catch {
        console.error('Auth initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshProfiles = async () => {
    const profiles = await fetchAllProfiles();
    setAllProfiles(profiles);
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (getSupabaseConfig().isConfigured) {
        if (!supabase || !password) return false;
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (!error && data?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            if (profile) {
              if (profile.is_active === false) {
                await supabase.auth.signOut();
                throw new Error('Your account is pending administrator approval. Please wait for an administrator to activate your account.');
              }
              const u: UserProfile = {
                id: profile.id,
                email: profile.email,
                role: profile.role,
                isActive: profile.is_active ?? true,
                fullName: profile.full_name,
                companyName: profile.company_name,
                createdAt: profile.created_at
              };
              setCurrentUser(u);
              const profiles = await fetchAllProfiles();
              setAllProfiles(profiles);
              setImpersonatedCustomer(null);
              return true;
            }
          }
          if (data?.user) await supabase.auth.signOut();
          return false;
        } catch (err: any) {
          if (err?.message?.includes('pending administrator approval')) {
            throw err;
          }
          return false;
        }
      }

      if (!import.meta.env.DEV) return false;

      // Check stored profiles
      const profiles = getStoredProfiles();
      const match = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
      if (match) {
        setCurrentUser(match);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(match));
        setImpersonatedCustomer(null);
        setIsLoading(false);
        return true;
      }

      // If email doesn't exist, create a customer account on the fly for ease of use
      const newAcc = await createNewAccount(
        email,
        password || '',
        email.split('@')[0],
        'customer',
        'New Client Co'
      );
      setCurrentUser(newAcc);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newAcc));
      await refreshProfiles();
      setIsLoading(false);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setCurrentUser(null);
    setImpersonatedCustomer(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const createAccount = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    companyName?: string
  ): Promise<UserProfile> => {
    let created: UserProfile;
    if (getSupabaseConfig().isConfigured) {
      if (!currentUser) {
        if (role !== 'customer') {
          throw new Error('Admin accounts can only be created by an authenticated admin.');
        }
        created = await createNewAccount(email, password, fullName, role, companyName);
      } else if (currentUser.role === 'admin') {
        created = await createAccountAsAdmin(email, password, fullName, role, companyName);
      } else {
        throw new Error('Only an authenticated admin can create accounts while signed in.');
      }
    } else {
      if (!import.meta.env.DEV) {
        throw new Error('Configure Supabase before creating accounts in a production build.');
      }
      created = await createNewAccount(email, password, fullName, role, companyName);
    }
    if (currentUser?.role === 'admin') {
      await refreshProfiles();
    }
    return created;
  };

  const updateAccount = async (
    userId: string,
    fullName: string,
    role: UserRole,
    companyName?: string
  ): Promise<UserProfile> => {
    if (currentUser?.role !== 'admin') throw new Error('Only an admin can edit accounts.');

    const updated = await updateAccountAsAdmin(userId, fullName, role, companyName);
    await refreshProfiles();
    setCurrentUser((user) => user?.id === updated.id ? updated : user);
    setImpersonatedCustomer((customer) => customer?.id === updated.id ? updated : customer);
    return updated;
  };

  const setAccountActive = async (userId: string, isActive: boolean): Promise<UserProfile> => {
    if (currentUser?.role !== 'admin') throw new Error('Only an admin can change account status.');

    const updated = await setAccountActiveAsAdmin(userId, isActive);
    await refreshProfiles();
    return updated;
  };

  const requestPasswordReset = async (resetEmail: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase && getSupabaseConfig().isConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin
      });
      if (error) throw new Error(error.message);
    } else {
      // Local/demo fallback
      const profiles = getStoredProfiles();
      const exists = profiles.some(p => p.email.toLowerCase() === resetEmail.trim().toLowerCase());
      if (!exists) throw new Error('No user account found with that email address.');
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase && getSupabaseConfig().isConfigured) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw new Error(error.message);
    }
  };

  const switchUserRoleDemo = (role: UserRole) => {
    if (!import.meta.env.DEV || getSupabaseConfig().isConfigured) return;
    const profiles = getStoredProfiles();
    const target = profiles.find(p => p.role === role);
    if (target) {
      setCurrentUser(target);
      setImpersonatedCustomer(null);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(target));
    }
  };

  // If the current user is an admin and has selected an impersonated customer,
  // effectiveUser is that customer so all actions are performed on their behalf!
  const effectiveUser = impersonatedCustomer || currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        effectiveUser,
        impersonatedCustomer,
        allProfiles,
        isSupabaseConfigured,
        isLoading,
        login,
        logout,
        setImpersonatedCustomer,
        createAccount,
        updateAccount,
        setAccountActive,
        requestPasswordReset,
        updatePassword,
        refreshProfiles,
        switchUserRoleDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
