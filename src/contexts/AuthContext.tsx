import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'github' | 'facebook' | 'gitlab') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function getUserProfile(userId: string) {
    console.log('Fetching user profile for ID:', userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url, role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    console.log('Retrieved profile:', profile);
    return profile;
  }

  async function updateUserWithProfile(authUser: any) {
    console.log('Updating user with profile. Auth user:', authUser);
    
    if (!authUser) {
      setUser(null);
      return;
    }

    try {
      const profile = await getUserProfile(authUser.id);
      console.log('Profile for user update:', profile);
      
      // Set the user immediately with auth data
      const initialUser = {
        ...authUser,
        role: authUser.role || 'user' // Default role
      };
      setUser(initialUser);
      
      // Then update with profile data if available
      if (profile) {
        const updatedUser = {
          ...authUser,
          username: profile.username || authUser.user_metadata?.username,
          full_name: profile.full_name || authUser.user_metadata?.full_name,
          avatar_url: profile.avatar_url,
          role: profile.role?.toLowerCase() || authUser.role || 'user'
        };
        
        console.log('Setting user with profile data:', updatedUser);
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Still set the user with auth data if profile fetch fails
      setUser({
        ...authUser,
        role: authUser.role || 'user'
      });
    }
  }

  useEffect(() => {
    // Set loading true when starting auth check
    setLoading(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        updateUserWithProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        updateUserWithProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address');
        } else {
          throw error;
        }
      }
      
      console.log("Auth sign in successful, data:", data);
      
      if (data.user) {
        // Make sure the user profile is fully loaded with the correct role
        await updateUserWithProfile(data.user);
        
        // Get fresh profile data to ensure role is set correctly
        const profile = await getUserProfile(data.user.id);
        console.log("Sign-in: got profile with role:", profile?.role);
        
        // Set role on the returned data object
        if (profile?.role) {
          data.user.role = profile.role;
        }
        
        console.log("Returning user data with role:", data.user.role);
      }
      
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          role: 'user' // Default role for new users
        }
      }
    });

    if (error) throw error;

    // The profile will be created automatically via the database trigger
    if (data.user) {
      await updateUserWithProfile(data.user);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithProvider = async (provider: 'github' | 'facebook' | 'gitlab') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithProvider }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};