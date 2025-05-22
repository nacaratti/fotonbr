import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading to true

  const fetchUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      // Do not set loading to false here as the overall auth state might still be loading
      return null; 
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        console.error('Error fetching profile:', error.message);
        setProfile(null);
        return null;
      }
      setProfile(data); // data can be null if no profile found, which is handled
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
    if (!isMounted) return;
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
      }

      const currentUser = session?.user ?? null;
      if (isMounted) setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        if (isMounted) setProfile(null);
      }
    } catch (e) {
      console.error("Initialization error:", e.message);
    } finally {
      if (isMounted) setLoading(false);  // <- Adicione isso
    }
  };

  initializeAuth();

  return () => {
    isMounted = false;
  };
}, []);


  const value = {
    signUp: async (data) => {
      const { email, password, options } = data;
      // Note: After user signs up, their profile will have role 'user' by default.
      // To make a user an admin, manually update their 'role' to 'admin' in the Supabase Studio table 'profiles'.
      return supabase.auth.signUp({ email, password, options });
    },
    signIn: async (data) => {
        setLoading(true);
        const result = await supabase.auth.signInWithPassword(data);
        if (result.data.user) {
            await fetchUserProfile(result.data.user.id);
        }
        // setLoading(false) will be handled by onAuthStateChange or initializeAuth
        return result;
    },
    signOut: async () => {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      // User and profile will be set to null by onAuthStateChange
      // setLoading(false) will be handled by onAuthStateChange
      return { error };
    },
    user,
    profile,
    loading, // Expose loading state
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