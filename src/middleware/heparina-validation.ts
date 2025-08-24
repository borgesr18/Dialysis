import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Schemas de validação para o módulo Heparina
export const doseHeparinaSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  sessao_id: z.string().uuid('ID da sessão deve ser um UUID válido').optional(),
  dose_heparina: z.number().positive('Dose deve ser um número positivo'),
  unidade: z.enum(['UI', 'mg'], {
    errorMap: () => ({ message: 'Unidade deve ser UI ou mg' })
  }),
  tipo_acesso: z.enum(['fav', 'cvc', 'cateter'], {
    errorMap: () => ({ message: 'Tipo de acesso deve ser fav, cvc ou cateter' })
  }),
  aplicada: z.boolean().default(false),
  data_prescricao: z.string().datetime('Data de prescrição deve ser uma data válida'),
  data_aplicacao: z.string().datetime('Data de aplicação deve ser uma data válida').optional(),
  prescrito_por: z.string().uuid('ID do prescritor deve ser um UUID válido'),
  aplicado_por: z.string().uuid('ID do aplicador deve ser um UUID válido').optional(),
  observacoes: z.string().optional(),
  clinica_id: z.string().uuid('ID da clínica deve ser um UUID válido')
});

export const alertaHeparinaSchema = z.object({
  paciente_id: z.string().uuid('ID do paciente deve ser um UUID válido'),
  dose_heparina_id: z.string().uuid('ID da dose deve ser um UUID válido').optional(),
  tipo_alerta: z.enum(['dose_alta', 'dose_baixa', 'tempo_aplicacao', 'interacao'], {
    errorMap: () => ({ message: 'Tipo de alerta inválido' })
  }),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica'], {
    errorMap: () => ({ message: 'Severidade deve ser baixa, media, alta ou critica' })
  }),
  ativo: z.boolean().default(true),
  clinica_id: z.string().uuid('ID da clínica deve ser um UUID válido')
});

export const historicoAlteracaoSchema = z.object({
  dose_heparina_id: z.string().uuid('ID da dose deve ser um UUID válido'),
  dose_anterior: z.number().positive('Dose anterior deve ser um número positivo').optional(),
  dose_nova: z.number().positive('Dose nova deve ser um número positivo'),
  motivo_alteracao: z.string().min(1, 'Motivo da alteração é obrigatório'),
  alterado_por: z.string().uuid('ID do usuário deve ser um UUID válido'),
  observacoes: z.string().optional(),
  clinica_id: z.string().uuid('ID da clínica deve ser um UUID válido')
});

export const configuracaoAlertaSchema = z.object({
  tipo_acesso: z.enum(['fav', 'cvc', 'cateter'], {
    errorMap: () => ({ message: 'Tipo de acesso deve ser fav, cvc ou cateter' })
  }),
  dose_minima: z.number().positive('Dose mínima deve ser um número positivo'),
  dose_maxima: z.number().positive('Dose máxima deve ser um número positivo'),
  tempo_maximo_aplicacao: z.number().positive('Tempo máximo deve ser um número positivo'),
  ativo: z.boolean().default(true),
  clinica_id: z.string().uuid('ID da clínica deve ser um UUID válido')
}).refine(data => data.dose_maxima > data.dose_minima, {
  message: 'Dose máxima deve ser maior que dose mínima',
  path: ['dose_maxima']
});

// Função para validar dados de entrada
export function validateRequestData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

// Função para verificar permissões de clínica
export async function validateClinicaAccess(clinica_id: string, user_id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('usuarios_clinicas')
      .select('id')
      .eq('clinica_id', clinica_id)
      .eq('user_id', user_id)
      .eq('ativo', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'Usuário não tem acesso à clínica' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao verificar acesso à clínica' };
  }
}

// Função para verificar se paciente pertence à clínica
export async function validatePacienteClinica(paciente_id: string, clinica_id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', paciente_id)
      .eq('clinica_id', clinica_id)
      .single();

    if (error || !data) {
      return { success: false, error: 'Paciente não encontrado ou não pertence à clínica' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao verificar paciente' };
  }
}

// Função para tratamento de erros padronizado
export function handleApiError(error: unknown): NextResponse {
  console.error('Erro na API:', error);
  
  if (error instanceof z.ZodError) {
    const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    return NextResponse.json(
      { error: `Dados inválidos: ${errorMessage}` },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
}

// Função para extrair ID da clínica do usuário autenticado
export async function getClinicaIdFromUser(): Promise<{
  success: boolean;
  clinica_id?: string;
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data: usuarioClinica, error: clinicaError } = await supabase
      .from('usuarios_clinicas')
      .select('clinica_id')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .single();

    if (clinicaError || !usuarioClinica) {
      return { success: false, error: 'Usuário não está associado a uma clínica' };
    }

    return { success: true, clinica_id: usuarioClinica.clinica_id };
  } catch (error) {
    return { success: false, error: 'Erro ao obter clínica do usuário' };
  }
}