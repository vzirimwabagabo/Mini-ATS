import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { createAccountAsAdmin, createNewAccount, deleteAccountAsAdmin, fetchAllProfiles, getStoredProfiles, initLocalStorageIfEmpty, setAccountActiveAsAdmin, updateAccountAsAdmin } from '../lib/storage';
import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity limit
const SESSION_WARNING_MS = 2 * 60 * 1000; // 2 minutes warning before expiration
const AUTH_LAST_ACTIVITY_KEY = 'mini_ats_last_activity';

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
  deleteAccount: (userId: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  refreshProfiles: () => Promise<void>;
  switchUserRoleDemo: (role: UserRole) => void;
  sessionTimedOut: boolean;
  clearSessionTimeoutAlert: () => void;
  sessionWarningOpen: boolean;
  stayLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'mini_ats_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [impersonatedCustomer, setImpersonatedCustomer] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);
  const [sessionTimedOut, setSessionTimedOut] = useState<boolean>(false);
  const [sessionWarningOpen, setSessionWarningOpen] = useState<boolean>(false);

  useEffect(() => {
    const { isConfigured } = getSupabaseConfig();
    setIsSupabaseConfigured(isConfigured);

    const initAuth = async () => {
      try {
        const lastActStr = localStorage.getItem(AUTH_LAST_ACTIVITY_KEY);
        const storedLastActivity = lastActStr ? Number(lastActStr) : 0;
        const isSessionExpired = storedLastActivity > 0 && (Date.now() - storedLastActivity > INACTIVITY_TIMEOUT_MS);

        if (!isConfigured && import.meta.env.DEV) {
          initLocalStorageIfEmpty();
          const storedUser = localStorage.getItem(AUTH_USER_KEY);
          if (storedUser) {
            if (isSessionExpired) {
              localStorage.removeItem(AUTH_USER_KEY);
              localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
              setSessionTimedOut(true);
            } else {
              try {
                setCurrentUser(JSON.parse(storedUser));
                localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
              } catch {
                localStorage.removeItem(AUTH_USER_KEY);
              }
            }
          }

          const profiles = await fetchAllProfiles();
          setAllProfiles(profiles);

          if (!storedUser && !isSessionExpired) {
            const defaultAdmin = profiles.find(p => p.role === 'admin') || profiles[0];
            if (defaultAdmin) {
              setCurrentUser(defaultAdmin);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultAdmin));
              localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
            }
          }
          return;
        }

        if (!isConfigured) return;

        const supabase = getSupabaseClient();
        if (supabase) {
          // Detect password recovery flags in URL
          const hash = window.location.hash || '';
          const search = window.location.search || '';
          if (
            hash.includes('type=recovery') ||
            search.includes('type=recovery') ||
            search.includes('recovery') ||
            hash.includes('recovery_token')
          ) {
            setIsPasswordRecovery(true);
          }

          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            if (isSessionExpired) {
              await supabase.auth.signOut({ scope: 'local' });
              localStorage.removeItem(AUTH_USER_KEY);
              localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
              setSessionTimedOut(true);
              return;
            }

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
              localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
              if (profile.role === 'admin') {
                const profiles = await fetchAllProfiles();
                setAllProfiles(profiles);
              }
            } else {
              await supabase.auth.signOut({ scope: 'local' });
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

    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsPasswordRecovery(true);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setIsPasswordRecovery(false);
          }
        });

        return () => {
          listener?.subscription?.unsubscribe();
        };
      }
    }
  }, []);

  // Monitor user activity and auto-logout on 30 minutes of inactivity
  useEffect(() => {
    if (!currentUser) return;

    let lastRecorded = Date.now();
    localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, lastRecorded.toString());

    const onUserActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 15000) {
        lastRecorded = now;
        localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, now.toString());
      }
      setSessionWarningOpen(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      const last = Number(localStorage.getItem(AUTH_LAST_ACTIVITY_KEY) || Date.now());
      const idleTime = Date.now() - last;

      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        logout();
        setSessionTimedOut(true);
        setSessionWarningOpen(false);
      } else if (idleTime >= INACTIVITY_TIMEOUT_MS - SESSION_WARNING_MS) {
        setSessionWarningOpen(true);
      } else {
        setSessionWarningOpen(false);
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserActivity));
      clearInterval(checkInterval);
    };
  }, [currentUser]);

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
                await supabase.auth.signOut({ scope: 'local' });
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
              localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
              setSessionTimedOut(false);
              setSessionWarningOpen(false);
              const profiles = await fetchAllProfiles();
              setAllProfiles(profiles);
              setImpersonatedCustomer(null);
              return true;
            }
          }
          if (data?.user) await supabase.auth.signOut({ scope: 'local' });
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
        localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
        setSessionTimedOut(false);
        setSessionWarningOpen(false);
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
      localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
      setSessionTimedOut(false);
      setSessionWarningOpen(false);
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
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
    }
    setCurrentUser(null);
    setImpersonatedCustomer(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY);
    setSessionWarningOpen(false);
  };

  const stayLoggedIn = () => {
    localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, Date.now().toString());
    setSessionWarningOpen(false);
  };

  const clearSessionTimeoutAlert = () => {
    setSessionTimedOut(false);
  };

  const deleteAccount = async (userId: string): Promise<void> => {
    if (currentUser?.role !== 'admin') throw new Error('Only an admin can delete accounts.');
    if (userId === currentUser?.id) throw new Error('You cannot delete your own account while signed in.');

    await deleteAccountAsAdmin(userId);
    await refreshProfiles();
    if (impersonatedCustomer?.id === userId) {
      setImpersonatedCustomer(null);
    }
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
      if (error) {
        if (error.message?.toLowerCase().includes('redirect') || (error as any).status === 400) {
          throw new Error(
            `Supabase rejected redirect URL "${window.location.origin}". Add this URL (or "https://*.vercel.app/**") to Supabase Dashboard > Authentication > URL Configuration > Redirect URLs.`
          );
        }
        if ((error as any).status === 429 || error.message?.toLowerCase().includes('rate limit')) {
          throw new Error('Supabase email rate limit exceeded. Please wait a few minutes before requesting another reset email.');
        }
        throw new Error(error.message);
      }
    } else {
      // Local/demo fallback
      const profiles = getStoredProfiles();
      const exists = profiles.some(p => p.email.toLowerCase() === resetEmail.trim().toLowerCase());
      if (!exists) throw new Error('No user account found with that email address.');
      setIsPasswordRecovery(true);
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase && getSupabaseConfig().isConfigured) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw new Error(error.message);
      setIsPasswordRecovery(false);
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } else {
      setIsPasswordRecovery(false);
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
        deleteAccount,
        requestPasswordReset,
        updatePassword,
        isPasswordRecovery,
        setIsPasswordRecovery,
        refreshProfiles,
        switchUserRoleDemo,
        sessionTimedOut,
        clearSessionTimeoutAlert,
        sessionWarningOpen,
        stayLoggedIn
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
