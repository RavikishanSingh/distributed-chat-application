import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username: string, name: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[Supabase Auth] Error fetching profile:', error);
      }

      if (data) {
        setUser({
          _id: data.id,
          name: data.name || data.username || email.split('@')[0],
          username: data.username || email.split('@')[0],
          email: data.email || email,
          avatar: data.avatar_url || '',
          bio: data.bio || '',
          status: data.status || 'online',
          role: data.role || 'user',
        });
      } else {
        // Fallback user state if profile record is missing
        setUser({
          _id: userId,
          name: email.split('@')[0],
          username: email.split('@')[0],
          email: email,
          avatar: '',
          bio: '',
          status: 'online',
          role: 'user',
        });
      }
    } catch (err) {
      console.error('[Supabase Auth] Failed to load profile:', err);
    }
  };

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setToken(session.access_token);
        fetchUserProfile(session.user.id, session.user.email || '');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setToken(session.access_token);
        await fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await fetchUserProfile(data.user.id, data.user.email || email);
    }
    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    username: string,
    name: string
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      // Upsert profile entry
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: data.user.id,
        username: username || email.split('@')[0],
        name: name || username,
        email: email,
        avatar_url: '',
        bio: '',
        status: 'online',
        role: 'user',
      });

      if (profileErr) {
        console.warn('[Supabase Auth] Profile upsert warning:', profileErr.message);
      }

      await fetchUserProfile(data.user.id, email);
    }

    return { error: null };
  };

  const logout = async () => {
    if (user?._id) {
      await supabase.from('profiles').update({ status: 'offline' }).eq('id', user._id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    if (!user) return;
    const updates = {
      name: updatedUser.name ?? user.name,
      username: updatedUser.username ?? user.username,
      avatar_url: updatedUser.avatar ?? user.avatar,
      bio: updatedUser.bio ?? user.bio,
      status: updatedUser.status ?? user.status,
    };

    const { error } = await supabase.from('profiles').update(updates).eq('id', user._id);
    if (!error) {
      setUser({ ...user, ...updatedUser });
    } else {
      console.error('[Supabase Auth] Failed to update profile:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signUp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
