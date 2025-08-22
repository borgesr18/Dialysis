'use client';

import { createClient } from '@/lib/supabase-client';
import { useCallback, useState } from 'react';
import type { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseOptions {
  onError?: (error: PostgrestError | Error) => void;
  onSuccess?: (data: any) => void;
}

interface QueryState<T = any> {
  data: T | null;
  error: PostgrestError | Error | null;
  loading: boolean;
}

export function useSupabase(options?: UseSupabaseOptions) {
  const supabase = createClient();
  const [queryState, setQueryState] = useState<QueryState>({
    data: null,
    error: null,
    loading: false,
  });

  const executeQuery = useCallback(async <T = any>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
  ): Promise<{ data: T | null; error: PostgrestError | Error | null }> => {
    setQueryState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await queryFn();
      
      setQueryState({
        data: result.data,
        error: result.error,
        loading: false,
      });

      if (result.error) {
        options?.onError?.(result.error);
      } else {
        options?.onSuccess?.(result.data);
      }

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erro desconhecido');
      
      setQueryState({
        data: null,
        error: errorObj,
        loading: false,
      });

      options?.onError?.(errorObj);
      
      return { data: null, error: errorObj };
    }
  }, [options]);

  const resetState = useCallback(() => {
    setQueryState({
      data: null,
      error: null,
      loading: false,
    });
  }, []);

  // Função utilitária para queries com filtro de clínica
  const queryWithClinic = useCallback((
    table: string,
    clinicId: string,
    select: string = '*'
  ) => {
    return supabase
      .from(table)
      .select(select)
      .eq('clinica_id', clinicId);
  }, [supabase]);

  // Função utilitária para inserção com clínica
  const insertWithClinic = useCallback((
    table: string,
    data: any,
    clinicId: string
  ) => {
    return supabase
      .from(table)
      .insert({ ...data, clinica_id: clinicId });
  }, [supabase]);

  // Função utilitária para atualização com verificação de clínica
  const updateWithClinic = useCallback((
    table: string,
    data: any,
    id: string,
    clinicId: string
  ) => {
    return supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .eq('clinica_id', clinicId);
  }, [supabase]);

  // Função utilitária para exclusão com verificação de clínica
  const deleteWithClinic = useCallback((
    table: string,
    id: string,
    clinicId: string
  ) => {
    return supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('clinica_id', clinicId);
  }, [supabase]);

  return {
    supabase,
    executeQuery,
    queryState,
    resetState,
    // Utilitários para queries com clínica
    queryWithClinic,
    insertWithClinic,
    updateWithClinic,
    deleteWithClinic,
    // Estados individuais para facilitar o uso
    data: queryState.data,
    error: queryState.error,
    loading: queryState.loading,
  };
}

