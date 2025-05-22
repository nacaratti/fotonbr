import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (error.code === 'PGRST116') { // "PGRST116" means "0 rows" were returned, which is not an "error" for profile fetching, just means no profile exists yet.
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
    setLoading(true);

    const processAuthStateChange = async (sessionUser) => {
      if (!isMounted) return;

      setUser(sessionUser);
      if (sessionUser) {
        await fetchUserProfile(sessionUser.id);
      } else {
        setProfile(null);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };
    
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      await processAuthStateChange(session?.user ?? null);
    }).catch(error => {
      console.error("Error in initial getSession:", error);
      if (isMounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        setLoading(true); 
        await processAuthStateChange(session?.user ?? null);
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
      // onAuthStateChange will eventually set loading to false
      if(result.error) setLoading(false);
      return result;
    },
    signIn: async (data) => {
      setLoading(true); 
      const result = await supabase.auth.signInWithPassword(data);
      // onAuthStateChange will eventually set loading to false
      if (result.error) { 
        setLoading(false);
      }
      return result;
    },
    signOut: async () => {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      // onAuthStateChange will eventually set loading to false
      if (error) { 
        setLoading(false);
      }
      return { error };
    },
    user,
    profile,
    loading,
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