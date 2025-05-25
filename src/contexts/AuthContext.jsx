import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserProfile = useCallback(async (userId) => {
    console.log('🔍 fetchUserProfile START - userId:', userId);
    
    if (!userId) {
      console.log('❌ userId é null, setando profile null');
      setProfile(null);
      return null;
    }

    try {
      console.log('📡 Fazendo query profiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 Query resultado:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro na query:', error.message);
        setProfile(null);
        return null;
      }

      console.log('✅ Profile setado:', data);
      setProfile(data);
      return data;
      
    } catch (e) {
      console.error('💥 Exceção fetchUserProfile:', e);
      setProfile(null);
      return null;
    } finally {
      console.log('🏁 fetchUserProfile END');
    }
  }, []);

  // Função para atualizar o estado do usuário
  const updateAuthState = useCallback(async (session) => {
    console.log('🔄 updateAuthState - session:', !!session);
    
    const currentUser = session?.user ?? null;
    console.log('👤 Usuário atual:', currentUser?.id || 'null');
    
    // Atualiza o usuário imediatamente
    setUser(currentUser);
    
    if (currentUser) {
      console.log('🔄 Buscando perfil para o usuário...');
      await fetchUserProfile(currentUser.id);
    } else {
      console.log('❌ Sem usuário, limpando perfil');
      setProfile(null);
    }
    
    // Marca como não carregando após processar
    setLoading(false);
  }, [fetchUserProfile]);

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect INICIADO');
    
    // Previne múltiplas inicializações
    if (initialized) {
      console.log('⚠️ Já inicializado, pulando...');
      return;
    }

    let mounted = true;
    let authSubscription = null;

    const initializeAuth = async () => {
      try {
        console.log('🔍 STEP 1: Verificando sessão inicial...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📊 STEP 2: Sessão obtida:', { session: !!session, error });

        if (error) {
          console.error('❌ STEP 3: Erro ao obter sessão:', error);
        }

        // Só atualiza se o componente ainda estiver montado
        if (mounted) {
          await updateAuthState(session);
          setInitialized(true);
        }
    
      } catch (error) {
        console.error('💥 ERRO na inicialização:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Configura o listener ANTES da inicialização
    console.log('👂 Configurando listener de auth...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // listener callback
      }
    );
    authSubscription = subscription;

    // Inicializa a autenticação
    console.log('🔄 Iniciando autenticação...');
    initializeAuth();

    return () => {
      console.log('🧹 AuthProvider CLEANUP');
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [initialized, updateAuthState]);

  // Log do estado sempre que mudar
  useEffect(() => {
    console.log('📊 ESTADO ATUAL:', {
      user: user?.id || 'null',
      profile: profile?.id || 'null',
      loading,
      initialized
    });
  }, [user, profile, loading, initialized]);

  const signUp = async ({ email, password, options }) => {
    console.log('📝 SignUp iniciado');
    try {
      const result = await supabase.auth.signUp({ email, password, options });
      console.log('✅ SignUp resultado:', !!result.data.user);
      return result;
    } catch (error) {
      console.error('❌ Erro no SignUp:', error);
      throw error;
    }
  };

  const signIn = async ({ email, password }) => {
    console.log('🔐 SignIn iniciado');
    try {
      setLoading(true);
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log('✅ SignIn resultado:', !!result.data.user);
      if (result.data.user) {
        window.location.href = '/';
      }
      // Não precisa atualizar manualmente aqui, o listener vai cuidar
      return result;
    } catch (error) {
      console.error('❌ Erro no SignIn:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 SignOut iniciado');
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      console.log('✅ SignOut resultado:', !error);
      if (!error) {
        console.log('🏠 Redirecionando para home após logout...');
        window.location.href = '/';
      }
      
      // Não precisa atualizar manualmente aqui, o listener vai cuidar
      return { error };
    } catch (error) {
      console.error('❌ Erro no SignOut:', error);
      setLoading(false);
      throw error;
    }
  };

  const updateUserProfile = async (updatedProfileData) => {
    if (!user) return { error: { message: "Usuário não autenticado" } };

    console.log('🔄 Atualizando perfil do usuário...');
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfileData)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        console.log('✅ Perfil atualizado:', data);
        setProfile(data);
      } else {
        console.error('❌ Erro ao atualizar perfil:', error);
      }

      return { data, error };
    } catch (error) {
      console.error('💥 Exceção ao atualizar perfil:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    console.log('🔄 Refresh profile solicitado');
    if (user) {
      return await fetchUserProfile(user.id);
    }
    return null;
  };

  const value = {
    user,
    profile,
    loading: loading || !initialized, // Considera loading até estar inicializado
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    refreshProfile,
    initialized, // Expõe o estado de inicialização
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};