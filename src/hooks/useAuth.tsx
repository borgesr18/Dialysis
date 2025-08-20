'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<PapelUsuario | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setRole(null);
      setClinicId(null);
      return;
    }

    try {
      // Buscar papel do usuário
      const { data: perfilData } = await supabase
        .from('perfis_usuarios')
        .select('papel')
        .eq('id', currentUser.id)
        .maybeSingle();

      setRole((perfilData?.papel as PapelUsuario) || null);

      // Buscar clínica do usuário
      const { data: clinicaData } = await supabase
        .from('usuarios_clinicas')
        .select('clinica_id')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setClinicId(clinicaData?.clinica_id || null);
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      setRole(null);
      setClinicId(null);
    }
  };

  const refreshUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    await fetchUserData(currentUser);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setClinicId(null);
  };

  useEffect(() => {
    // Buscar usuário inicial
    const getInitialUser = async () => {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      setUser(initialUser);
      await fetchUserData(initialUser);
      setLoading(false);
    };

    getInitialUser();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        await fetchUserData(currentUser);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const contextValue = {
    user,
    loading,
    role,
    clinicId,
    signOut,
    refreshUser,
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
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  return { user, loading };
}

export function useRequireRole(requiredRoles: PapelUsuario[]) {
  const { user, role, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && (!user || !role || !requiredRoles.includes(role))) {
      window.location.href = '/forbidden';
    }
  }, [user, role, loading, requiredRoles]);

  return { user, role, loading };
}