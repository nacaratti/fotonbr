import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Função para buscar o perfil no banco
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
        console.error('Erro ao buscar perfil:', error.message);
        setProfile(null);
        return null;
      }

      setProfile(data);
      return data;
    } catch (e) {
      console.error('Exceção ao buscar perfil:', e.message);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError.message);
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
        console.error("Erro na inicialização da autenticação:", e.message);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // 🔥 Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔄 Alteração no estado de auth:', event);

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          if (currentUser) {
            await fetchUserProfile(currentUser.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // 🔥 Inicializar
    initializeAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 🔑 Funções de autenticação
  const signUp = async ({ email, password, options }) => {
    return supabase.auth.signUp({ email, password, options });
  };

  const signIn = async ({ email, password }) => {
    try {
      setLoading(true);
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedProfileData) => {
    if (!user) return { error: { message: "Usuário não autenticado" } };

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
  };

  const refreshProfile = async () => {
    if (user) {
      return await fetchUserProfile(user.id);
    }
    return null;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
