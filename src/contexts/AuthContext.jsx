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
    let initializationTimeout;

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

    const initializeAuth = async () => {
      try {
        // Timeout de segurança para evitar loading infinito
        initializationTimeout = setTimeout(() => {
          if (isMounted && !initialized) {
            console.warn('Auth initialization timeout - setting as initialized');
            setUser(null);
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
        }, 5000); // 5 segundos de timeout

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          // Mesmo com erro, inicializa para não travar
          if (isMounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Limpa o timeout pois conseguiu obter a sessão
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }

        await processAuthStateChange(session?.user ?? null, true);
        
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

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        // Eventos que devem resetar o estado de loading
        const loadingEvents = ['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'];
        
        if (loadingEvents.includes(event)) {
          await processAuthStateChange(session?.user ?? null, false);
        } else {
          // Para outros eventos, apenas atualiza o user sem loading
          setUser(session?.user ?? null);
        }
      }
    );

    // Inicializar
    initializeAuth();

    // Listener para mudanças na aba (quando volta o foco)
    const handleVisibilityChange = () => {
      if (!document.hidden && initialized) {
        // Quando a aba volta ao foco, revalida a sessão
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (isMounted) {
            const currentUser = session?.user ?? null;
            if (currentUser?.id !== user?.id) {
              // Só atualiza se o usuário realmente mudou
              processAuthStateChange(currentUser, false);
            }
          }
        }).catch(error => {
          console.error('Error revalidating session on tab focus:', error);
        });
      }
    };

    // Listener para storage changes (sincronização entre abas)
    const handleStorageChange = (e) => {
      if (e.key === 'supabase.auth.token' && initialized) {
        // Token mudou em outra aba, revalida sessão
        setTimeout(() => {
          if (isMounted) {
            supabase.auth.getSession().then(({ data: { session } }) => {
              const currentUser = session?.user ?? null;
              if (currentUser?.id !== user?.id) {
                processAuthStateChange(currentUser, false);
              }
            }).catch(error => {
              console.error('Error handling storage change:', error);
            });
          }
        }, 100); // Pequeno delay para garantir que o Supabase processou a mudança
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchUserProfile, user?.id, initialized]);

  const value = {
    signUp: async (data) => {
      setLoading(true);
      try {
        const { email, password, options } = data;
        const result = await supabase.auth.signUp({ email, password, options });
        if(result.error) setLoading(false);
        return result;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    signIn: async (data) => {
      setLoading(true);
      try {
        const result = await supabase.auth.signInWithPassword(data);
        if (result.error) { 
          setLoading(false);
        }
        return result;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    signOut: async () => {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signOut();
        if (error) { 
          setLoading(false);
        }
        return { error };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    user,
    profile,
    loading,
    initialized,
    isAuthReady: initialized && !loading,
    updateUserProfile: async (updatedProfileData) => {
      if (!user) return { error: { message: "User not authenticated" } };
      setLoading(true);
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
        return { error };
      } finally {
        setLoading(false);
      }
    },
    // Função para forçar revalidação manual se necessário
    revalidateSession: async () => {
      if (!initialized) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await processAuthStateChange(session?.user ?? null, false);
      } catch (error) {
        console.error('Error revalidating session:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};