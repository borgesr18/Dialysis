// Tipos compartilhados para o sistema de hemodiálise

import { Database, Paciente as PacienteDB, Maquina as MaquinaDB, Turno as TurnoDB } from '@/types/database';

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

export type StatusAgendamento = 
  | 'agendado'
  | 'confirmado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado'
  | 'faltou';

export type TipoVisualizacaoCalendario = 'mensal' | 'semanal' | 'diaria';

export type StatusMaquina = 'ativa' | 'manutencao' | 'inativa';

export type StatusPaciente = 'ativo' | 'inativo' | 'transferido';

// ============================================================================
// INTERFACES DE ENTIDADES
// ============================================================================

// Tipos do banco de dados com extensões opcionais
export interface Paciente extends PacienteDB {
  status?: StatusPaciente;
}

export interface Maquina extends MaquinaDB {
  status?: StatusMaquina;
}

export type Turno = TurnoDB;

export interface AgendamentoSessao {
  id: string;
  paciente_id: string;
  maquina_id: string;
  turno_id: string;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim?: string;
  duracao_minutos?: number;
  status: StatusAgendamento;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  pacientes?: Paciente;
  maquinas?: Maquina;
  turnos?: Turno;
}

// ============================================================================
// INTERFACES PARA CALENDÁRIO
// ============================================================================

export interface EventoCalendario {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    agendamento: AgendamentoSessao;
    paciente: string;
    maquina: string;
    status: StatusAgendamento;
  };
}

export interface SlotDisponivel {
  data: Date;
  hora_inicio: string;
  hora_fim: string;
  turno_id: string;
  turno_nome: string;
  maquinas_disponiveis: string[];
}

export interface ConflitosAgendamento {
  conflitoPaciente: boolean;
  conflitoMaquina: boolean;
  agendamentosConflitantes?: AgendamentoSessao[];
}

// ============================================================================
// INTERFACES PARA FORMULÁRIOS
// ============================================================================

export interface CriarAgendamentoRequest {
  paciente_id: string;
  maquina_id: string;
  turno_id: string;
  data_agendamento: string;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos: number;
  observacoes?: string;
  clinica_id?: string;
}

export interface AtualizarAgendamentoRequest {
  paciente_id?: string;
  maquina_id?: string;
  turno_id?: string;
  data_agendamento?: string;
  hora_inicio?: string;
  hora_fim?: string;
  duracao_minutos?: number;
  status?: StatusAgendamento;
  observacoes?: string;
  motivo_cancelamento?: string;
}

// ============================================================================
// INTERFACES PARA FILTROS
// ============================================================================

export interface FiltrosAgendamento {
  pacienteId?: string;
  maquinaId?: string;
  turnoId?: string;
  status?: StatusAgendamento;
  dataInicio?: Date;
  dataFim?: Date;
  buscarTexto?: string;
}

// ============================================================================
// INTERFACES PARA RESPOSTAS DA API
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: any;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// INTERFACES PARA ESTATÍSTICAS
// ============================================================================

export interface EstatisticasAgendamento {
  total: number;
  agendados: number;
  confirmados: number;
  em_andamento: number;
  concluidos: number;
  cancelados: number;
  faltaram: number;
}

export interface EstatisticasPorPeriodo {
  periodo: string;
  estatisticas: EstatisticasAgendamento;
}

// ============================================================================
// INTERFACES PARA AUTENTICAÇÃO
// ============================================================================

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'medico' | 'enfermeiro' | 'tecnico';
  clinica_id: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Clinica {
  id: string;
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS PARA HOOKS
// ============================================================================

export interface UseAuthReturn {
  user: Usuario | null;
  clinica: Clinica | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Usuario>) => Promise<void>;
}

// ============================================================================
// TIPOS PARA VALIDAÇÃO
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// ============================================================================
// TIPOS PARA COMPONENTES UI
// ============================================================================

export type ButtonVariant = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export type InputVariant = 'default' | 'medical';

export type CardVariant = 
  | 'default'
  | 'elevated'
  | 'medical'
  | 'interactive'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gradient';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';