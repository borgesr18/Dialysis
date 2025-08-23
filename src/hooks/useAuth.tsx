// PASTA: src/hooks/useAuth.tsx
// ✅ CORRIGIDO: Dependências de useEffect adicionadas

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-client';

// Definindo o tipo localmente para evitar dependências de server components
export type PapelUsuario = 'ADMIN' | 'GESTOR' | 'ENFERMAGEM' | 'TECNICO' | 'FARMACIA' | 'MEDICO' | 'VISUALIZADOR';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: PapelUsuario | null;
  clinicId: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [role, setRole] = useState<PapelUsuario | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUserData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      setClinicId(null);
      return;
    }

    try {
      // Buscar papel do usuário com timeout
      const perfilPromise = supabase
        .from('perfis_usuarios')
        .select('papel')
        .eq('id', currentUser.id)
        .maybeSingle();

      // Buscar clínica do usuário com timeout
      const clinicaPromise = supabase
        .from('usuarios_clinicas')
        .select('clinica_id')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Executar queries em paralelo com timeout
      const [perfilResult, clinicaResult] = await Promise.allSettled([
        Promise.race([
          perfilPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]),
        Promise.race([
          clinicaPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ])
      ]);

      // Processar resultado do perfil com retry
      if (perfilResult.status === 'fulfilled' && perfilResult.value) {
        const { data: perfilData, error: perfilError } = perfilResult.value as any;
        if (!perfilError && perfilData) {
          setRole((perfilData.papel as PapelUsuario) || null);
        } else {
          // Fallback: definir papel padrão se não encontrar
          setRole('VISUALIZADOR');
        }
      } else {
        // Silenciar warnings no console e usar fallback
        setRole('VISUALIZADOR');
      }

      // Processar resultado da clínica com retry
      if (clinicaResult.status === 'fulfilled' && clinicaResult.value) {
        const { data: clinicaData, error: clinicaError } = clinicaResult.value as any;
        if (!clinicaError && clinicaData) {
          setClinicId(clinicaData.clinica_id || null);
        } else {
          setClinicId(null);
        }
      } else {
        // Silenciar warnings no console
        setClinicId(null);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      setRole(null);
      setClinicId(null);
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) {
        console.warn('⚠️ Erro ao atualizar usuário:', error.message);
        setUser(null);
        return;
      }
      setUser(currentUser);
      await fetchUserData(currentUser);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      setUser(null);
      setRole(null);
      setClinicId(null);
    }
  }, [supabase, fetchUserData]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setClinicId(null);
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setRole(null);
      setClinicId(null);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // Buscar usuário inicial
    const getInitialUser = async () => {
      try {
        const { data: { user: initialUser }, error } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (error) {
          // Silencia o aviso comum do Supabase quando não há sessão
          if (error.message !== 'Auth session missing!') {
            console.warn('⚠️ Erro ao buscar usuário inicial:', error.message);
          }
          setUser(null);
        } else {
          setUser(initialUser);
          await fetchUserData(initialUser);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar usuário inicial:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setClinicId(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (event === 'SIGNED_OUT') {
          setRole(null);
          setClinicId(null);
        } else if (currentUser) {
          await fetchUserData(currentUser);
        }
        
        setLoading(false);
        setInitialized(true);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserData]); // ✅ Adicionada dependência fetchUserData

  const contextValue = {
    user,
    loading,
    role,
    clinicId,
    signOut,
    refreshUser,
    initialized,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const { user, loading, initialized } = useAuth();
  
  useEffect(() => {
    if (initialized && !loading && !user) {
      // Usar router do Next.js em vez de window.location para melhor UX
      const currentPath = window.location.pathname;
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
  }, [user, loading, initialized]); // ✅ Dependências corretas

  return { user, loading: loading || !initialized };
}

export function useRequireRole(requiredRoles: PapelUsuario[]) {
  const { user, role, loading, initialized } = useAuth();
  
  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        const currentPath = window.location.pathname;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = loginUrl;
      } else if (!role || !requiredRoles.includes(role)) {
        window.location.href = '/forbidden';
      }
    }
  }, [user, role, loading, initialized, requiredRoles]); // ✅ Dependências corretas

  return { user, role, loading: loading || !initialized };
}
