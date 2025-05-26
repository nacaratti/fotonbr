import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false); // Flag para controlar se já inicializou

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

    const processAuthStateChange = async (sessionUser, isInitialLoad = false) => {
      if (!isMounted) return;

      // Só mostra loading após a inicialização, exceto na primeira carga
      if (!isInitialLoad && initialized) {
        setLoading(true);
      }

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
    
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      await processAuthStateChange(session?.user ?? null, true); // true = é carga inicial
    }).catch(error => {
      console.error("Error in initial getSession:", error);
      if (isMounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setInitialized(true);
      }
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        await processAuthStateChange(session?.user ?? null, false); // false = não é carga inicial
      }
    );

    return () => {
      isMounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  const value = {
    signUp: async (data) => {
      setLoading(true);
      const { email, password, options } = data;
      const result = await supabase.auth.signUp({ email, password, options });
      if(result.error) setLoading(false);
      return result;
    },
    signIn: async (data) => {
      setLoading(true); 
      const result = await supabase.auth.signInWithPassword(data);
      if (result.error) { 
        setLoading(false);
      }
      return result;
    },
    signOut: async () => {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) { 
        setLoading(false);
      }
      return { error };
    },
    user,
    profile,
    loading,
    initialized, // Expõe se já foi inicializado
    // Propriedade computada para facilitar uso no navbar
    isAuthReady: initialized && !loading,
    updateUserProfile: async (updatedProfileData) => {
      if (!user) return { error: { message: "User not authenticated" } };
      setLoading(true);
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
      setLoading(false);
      return { data, error };
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};