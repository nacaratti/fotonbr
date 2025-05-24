import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserProfile = useCallback(async (userId) => {
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
      
      if (error) {
        if (error.code === 'PGRST116') {
          setProfile(null); 
        } else {
          console.error('Error fetching profile:', error.message);
          setProfile(null);
        }
        return null;
      }
      setProfile(data);
      return data;
    } catch (e) {
      console.error('Exception fetching profile:', e.message);
      setProfile(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    const processAuthStateChange = async (sessionUser, isInitialLoad = false) => {
      if (!isMounted) return;

      setUser(sessionUser);
      if (sessionUser) {
        await fetchUserProfile(sessionUser.id);
      } else {
        setProfile(null);
      }
      
      if (isMounted) {
        setLoading(false);
        if (isInitialLoad) {
          setInitialized(true);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        // Timeout simples para evitar loading infinito
        const timeoutId = setTimeout(() => {
          if (isMounted && !initialized) {
            console.warn('Auth initialization taking too long, forcing completion');
            setUser(null);
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }, 3000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Limpa o timeout se conseguiu obter a sessão
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Error getting session:", error);
        }

        if (isMounted) {
          await processAuthStateChange(session?.user ?? null, true);
        }
        
      } catch (error) {
        console.error("Initialization error:", error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Configurar listener de mudanças de auth - APENAS UMA VEZ
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          
          console.log('Auth event:', event);
          
          // Só processa eventos importantes
          if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
            await processAuthStateChange(session?.user ?? null, false);
          }
        }
      );
      
      authSubscription = subscription;
    };

    // Inicializar tudo
    setupAuthListener();
    initializeAuth();

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]); // Removemos dependências desnecessárias

  const value = {
    signUp: async (data) => {
      const { email, password, options } = data;
      try {
        const result = await supabase.auth.signUp({ email, password, options });
        return result;
      } catch (error) {
        console.error('SignUp error:', error);
        throw error;
      }
    },
    
    signIn: async (data) => {
      try {
        const result = await supabase.auth.signInWithPassword(data);
        return result;
      } catch (error) {
        console.error('SignIn error:', error);
        throw error;
      }
    },
    
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        return { error };
      } catch (error) {
        console.error('SignOut error:', error);
        throw error;
      }
    },
    
    updateUserProfile: async (updatedProfileData) => {
      if (!user) return { error: { message: "User not authenticated" } };
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedProfileData)
          .eq('id', user.id)
          .select()
          .single();
        
        if (!error && data) {
          setProfile(data); 
        } else if (error) {
          console.error("Error updating profile:", error.message);
        }
        
        return { data, error };
      } catch (error) {
        console.error('UpdateProfile error:', error);
        return { error };
      }
    },
    
    user,
    profile,
    loading,
    initialized,
    isAuthReady: initialized && !loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};