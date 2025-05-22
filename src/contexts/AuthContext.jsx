import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return null; 
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message);
        setProfile(null);
        return null;
      }
      
      setProfile(data);
      return data;
    } catch (e) {
      console.error('Exception fetching profile:', e.message);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Buscar sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError.message);
        }

        const currentUser = session?.user ?? null;
        
        if (isMounted) {
          setUser(currentUser);
          
          if (currentUser) {
            await fetchUserProfile(currentUser.id);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      } catch (e) {
        console.error("Initialization error:", e.message);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event);
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await fetchUserProfile(currentUser.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Inicializar
    initializeAuth();

    // Cleanup
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    signUp: async (data) => {
      const { email, password, options } = data;
      return supabase.auth.signUp({ email, password, options });
    },
    
    signIn: async (data) => {
      try {
        setLoading(true);
        const result = await supabase.auth.signInWithPassword(data);
        
        // O onAuthStateChange vai lidar com o resto
        return result;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    
    signOut: async () => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        
        // O onAuthStateChange vai limpar user e profile
        return { error };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    
    updateUserProfile: async (updatedProfileData) => {
      if (!user) return { error: { message: "User not authenticated" } };
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedProfileData)
          .eq('id', user.id)
          .select()
          .single();
          
        if (!error && data) {
          setProfile(data);
        }
        
        return { data, error };
      } catch (error) {
        return { error };
      } finally {
        setLoading(false);
      }
    },
    
    // Função auxiliar para refresh do profile
    refreshProfile: async () => {
      if (user) {
        return await fetchUserProfile(user.id);
      }
      return null;
    },
    
    user,
    profile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};