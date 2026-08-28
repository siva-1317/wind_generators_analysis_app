import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

export interface RegisteredAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredUsers: RegisteredAccount[];
  login: (email: string, pass: string) => Promise<void>;
  loginGoogle: (gmailInput?: string) => Promise<void>;
  loginDemo: (role?: 'admin' | 'operator' | 'viewer', customEmail?: string) => void;
  registerNewUser: (newUser: { email: string; password?: string; name: string; role: 'admin' | 'operator' | 'viewer' }) => void;
  updateUser: (userId: string, updated: { email?: string; password?: string; name?: string; role?: 'admin' | 'operator' | 'viewer' }) => void;
  deleteUser: (userId: string) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isOperator: boolean;
  isViewer: boolean;
  canManageDevices: boolean;
  canAcknowledgeAlerts: boolean;
  canRunDiagnostics: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'windsense_demo_user';
const REGISTERED_USERS_KEY = 'windsense_registered_users';

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'usr-default-1',
    email: 'sathy@gmail.com',
    password: 'password123',
    name: 'Sathya Prakash',
    role: 'admin',
    avatar_url: 'https://unavatar.io/sathy@gmail.com?fallback=https://api.dicebear.com/7.x/initials/svg?seed=SathyaPrakash',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'usr-default-2',
    email: 'sathya.prakash@gmail.com',
    password: 'password123',
    name: 'Sathya Prakash',
    role: 'admin',
    avatar_url: 'https://unavatar.io/sathya.prakash@gmail.com?fallback=https://api.dicebear.com/7.x/initials/svg?seed=SathyaPrakash',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'usr-default-3',
    email: 'wind.operator@gmail.com',
    password: 'password123',
    name: 'Wind Operator',
    role: 'operator',
    avatar_url: 'https://unavatar.io/wind.operator@gmail.com?fallback=https://api.dicebear.com/7.x/initials/svg?seed=WindOperator',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

function resolveGoogleAvatar(email: string, metaAvatar?: string): string {
  if (metaAvatar && metaAvatar.startsWith('http')) return metaAvatar;
  if (email && email.includes('@')) {
    return `https://unavatar.io/${encodeURIComponent(email)}?fallback=https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=GoogleUser`;
}

function resolveGoogleName(email: string, metaName?: string): string {
  if (metaName && metaName.trim() && !metaName.includes('Operator')) return metaName;
  if (email && email.includes('@')) {
    const handle = email.split('@')[0];
    const parts = handle.split(/[._-]/);
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }
  return 'Google User';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredAccount[]>(() => {
    const saved = localStorage.getItem(REGISTERED_USERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    // 1. Check local demo user session
    const savedDemo = localStorage.getItem(DEMO_USER_KEY);
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    // 2. Check Supabase Auth session if configured
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const appMeta = session.user.app_metadata || {};
          const email = session.user.email || 'user@gmail.com';
          const name = resolveGoogleName(email, meta.full_name || meta.name);
          const avatar_url = resolveGoogleAvatar(email, meta.avatar_url || meta.picture);

          setUser({
            id: session.user.id,
            email,
            name,
            role: meta.role || 'admin',
            avatar_url,
            provider: appMeta.provider || 'google',
            email_verified: session.user.email_confirmed_at ? true : (meta.email_verified ?? true),
            last_sign_in_at: session.user.last_sign_in_at || new Date().toISOString(),
            created_at: session.user.created_at || new Date().toISOString(),
          });
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const appMeta = session.user.app_metadata || {};
          const email = session.user.email || 'user@gmail.com';
          const name = resolveGoogleName(email, meta.full_name || meta.name);
          const avatar_url = resolveGoogleAvatar(email, meta.avatar_url || meta.picture);

          setUser({
            id: session.user.id,
            email,
            name,
            role: meta.role || 'admin',
            avatar_url,
            provider: appMeta.provider || 'google',
            email_verified: session.user.email_confirmed_at ? true : (meta.email_verified ?? true),
            last_sign_in_at: session.user.last_sign_in_at || new Date().toISOString(),
            created_at: session.user.created_at || new Date().toISOString(),
          });
        } else if (!localStorage.getItem(DEMO_USER_KEY)) {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      loginDemo('admin', 'sathy@gmail.com');
      setIsLoading(false);
    }
  }, []);

  const registerNewUser = (newUser: {
    email: string;
    password?: string;
    name: string;
    role: 'admin' | 'operator' | 'viewer';
  }) => {
    const avatar_url = resolveGoogleAvatar(newUser.email);
    const account: RegisteredAccount = {
      id: `usr-reg-${Date.now()}`,
      email: newUser.email,
      password: newUser.password || 'password123',
      name: newUser.name || resolveGoogleName(newUser.email),
      role: newUser.role,
      avatar_url,
      created_at: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase());
      return [account, ...filtered];
    });
  };

  const updateUser = (
    userId: string,
    updated: { email?: string; password?: string; name?: string; role?: 'admin' | 'operator' | 'viewer' }
  ) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newEmail = updated.email || u.email;
          return {
            ...u,
            email: newEmail,
            name: updated.name || u.name,
            role: updated.role || u.role,
            password: updated.password || u.password,
            avatar_url: resolveGoogleAvatar(newEmail, u.avatar_url),
          };
        }
        return u;
      })
    );

    // Update active user state if editing currently logged-in account
    if (user && (user.id === userId || user.email.toLowerCase() === updated.email?.toLowerCase())) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              email: updated.email || prev.email,
              name: updated.name || prev.name,
              role: updated.role || prev.role,
              avatar_url: resolveGoogleAvatar(updated.email || prev.email, prev.avatar_url),
            }
          : null
      );
    }
  };

  const deleteUser = (userId: string) => {
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const login = async (email: string, pass: string) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        const meta = data.user.user_metadata || {};
        const userEmail = data.user.email || email;
        setUser({
          id: data.user.id,
          email: userEmail,
          name: resolveGoogleName(userEmail, meta.full_name || meta.name),
          role: meta.role || 'admin',
          avatar_url: resolveGoogleAvatar(userEmail, meta.avatar_url || meta.picture),
          provider: 'email',
          email_verified: true,
          last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString(),
          created_at: data.user.created_at || new Date().toISOString(),
        });
      }
    } else {
      const matched = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      const name = matched ? matched.name : resolveGoogleName(email);
      const role = matched ? matched.role : 'admin';
      const avatar_url = matched?.avatar_url || resolveGoogleAvatar(email);

      const demoUser: UserProfile = {
        id: matched ? matched.id : `usr-gmail-${Date.now()}`,
        name,
        email,
        role,
        avatar_url,
        provider: 'google',
        email_verified: true,
        isDemo: true,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
    }
  };

  const loginGoogle = async (gmailInput?: string) => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        if (
          err.message?.includes('provider is not enabled') ||
          err.message?.includes('validation_failed') ||
          err.status === 400
        ) {
          throw new Error(
            'Google Provider is not enabled in your Supabase project yet. Please enable Google in Supabase Dashboard > Authentication > Providers > Google, or enter your Gmail address below.'
          );
        }
        throw err;
      }
    } else {
      loginDemo('admin', gmailInput || 'sathy@gmail.com');
    }
  };

  const loginDemo = (role: 'admin' | 'operator' | 'viewer' = 'admin', customEmail = 'sathy@gmail.com') => {
    const matched = registeredUsers.find((u) => u.email.toLowerCase() === customEmail.toLowerCase());
    const email = matched ? matched.email : customEmail;
    const name = matched ? matched.name : resolveGoogleName(email);
    const userRole = matched ? matched.role : role;
    const avatar_url = matched?.avatar_url || resolveGoogleAvatar(email);

    const demoUser: UserProfile = {
      id: matched ? matched.id : `usr-google-${userRole}`,
      name,
      email,
      role: userRole,
      avatar_url,
      provider: 'google',
      email_verified: true,
      last_sign_in_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      isDemo: true,
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const role = user?.role || 'admin';
  const isAdmin = role === 'admin';
  const isOperator = role === 'operator' || role === 'admin';
  const isViewer = role === 'viewer';

  const canManageDevices = isAdmin;
  const canAcknowledgeAlerts = isOperator;
  const canRunDiagnostics = isOperator;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        registeredUsers,
        login,
        loginGoogle,
        loginDemo,
        registerNewUser,
        updateUser,
        deleteUser,
        logout,
        isAdmin,
        isOperator,
        isViewer,
        canManageDevices,
        canAcknowledgeAlerts,
        canRunDiagnostics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
