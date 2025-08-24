export interface Database {
  public: {
    Tables: {
      clinicas: {
        Row: {
          id: string;
          nome: string;
          cnpj?: string;
          email?: string;
          endereco?: string;
          telefone?: string;
          uf?: string;
          fuso_horario?: string;
          observacoes?: string;
          ativa?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clinicas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clinicas']['Insert']>;
      };
      pacientes: {
        Row: {
          id: string;
          clinica_id: string;
          registro: string;
          nome_completo: string;
          alerta_texto?: string | null;
          cidade_nome?: string | null;
          cpf?: string;
          rg?: string;
          data_nascimento?: string;
          telefone?: string;
          endereco?: string;
          cidade?: string;
          uf?: string;
          cep?: string;
          email?: string;
          contato_emergencia?: string;
          telefone_emergencia?: string;
          observacoes?: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pacientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pacientes']['Insert']>;
      };
      maquinas: {
        Row: {
          id: string;
          clinica_id: string;
          sala_id: string;
          identificador: string;
          marca?: string;
          modelo?: string;
          numero_serie?: string;
          ativa?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['maquinas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['maquinas']['Insert']>;
      };
      salas: {
        Row: {
          id: string;
          clinica_id: string;
          nome: string;
          descricao?: string;
          capacidade?: number;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['salas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['salas']['Insert']>;
      };
      turnos: {
        Row: {
          id: string;
          clinica_id: string;
          nome: string;
          hora_inicio: string;
          hora_fim: string;
          dias_semana: number[];
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['turnos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['turnos']['Insert']>;
      };
      escala_pacientes: {
        Row: {
          id: string;
          clinica_id: string;
          paciente_id: string;
          sala_id: string;
          maquina_id: string;
          turno_id: string;
          data_inicio: string;
          data_fim?: string;
          dias_semana: number[];
          observacoes?: string;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['escala_pacientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['escala_pacientes']['Insert']>;
      };
      usuarios_clinicas: {
        Row: {
          id: string;
          user_id: string;
          clinica_id: string;
          role: 'admin' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios_clinicas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['usuarios_clinicas']['Insert']>;
      };
      perfis_usuarios: {
        Row: {
          id: string;
          user_id: string;
          nome?: string;
          telefone?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['perfis_usuarios']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['perfis_usuarios']['Insert']>;
      };
      acessos_vasculares: {
        Row: {
          id: string;
          paciente_id: string;
          tipo: string;
          localizacao?: string;
          data_implante?: string;
          observacoes?: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['acessos_vasculares']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['acessos_vasculares']['Insert']>;
      };
      prescricoes_dialiticas: {
        Row: {
          id: string;
          paciente_id: string;
          tempo_sessao?: number;
          fluxo_sangue?: number;
          fluxo_dialisato?: number;
          ultrafiltração?: number;
          heparina?: number;
          observacoes?: string;
          data_prescricao: string;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prescricoes_dialiticas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['prescricoes_dialiticas']['Insert']>;
      };
      serologias: {
        Row: {
          id: string;
          paciente_id: string;
          hepatite_b?: string;
          hepatite_c?: string;
          hiv?: string;
          data_exame: string;
          observacoes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['serologias']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['serologias']['Insert']>;
      };
      docs_paciente: {
        Row: {
          id: string;
          paciente_id: string;
          clinica_id: string;
          storage_path: string;
          tipo: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['docs_paciente']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['docs_paciente']['Insert']>;
      };
      audit_log: {
        Row: {
          id: string;
          user_id?: string;
          clinica_id?: string;
          action: string;
          table_name?: string;
          record_id?: string;
          old_values?: any;
          new_values?: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>;
      };
      sessoes_hemodialise: {
        Row: {
          id: string;
          paciente_id: string;
          maquina_id: string;
          clinica_id: string;
          turno_id?: string;
          data_agendamento: string;
          hora_inicio: string;
          hora_fim?: string;
          peso_pre?: number;
          peso_pos?: number;
          ultrafiltração_prescrita?: number;
          ultrafiltração_realizada?: number;
          pressao_arterial_pre?: string;
          pressao_arterial_pos?: string;
          observacoes?: string;
          status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessoes_hemodialise']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sessoes_hemodialise']['Insert']>;
      };
      historico_acessos: {
        Row: {
          id: string;
          sessao_id: string;
          paciente_id: string;
          tipo_acesso: string;
          local_acesso?: string;
          observacoes?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['historico_acessos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['historico_acessos']['Insert']>;
      };
      prescricoes: {
        Row: {
          id: string;
          paciente_id: string;
          medico_responsavel?: string;
          tempo_dialise: number;
          fluxo_sangue?: number;
          fluxo_dialisato?: number;
          ultrafiltração?: number;
          anticoagulante?: string;
          dose_anticoagulante?: string;
          observacoes?: string;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prescricoes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['prescricoes']['Insert']>;
      };
      exames_laboratoriais: {
        Row: {
          id: string;
          paciente_id: string;
          data_coleta: string;
          tipo_exame: string;
          resultado?: any;
          valores_referencia?: any;
          observacoes?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exames_laboratoriais']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['exames_laboratoriais']['Insert']>;
      };
      doses_heparina: {
        Row: {
          id: string;
          paciente_id: string;
          sessao_id?: string;
          dose_heparina: number;
          dose_cateter?: number;
          tipo_acesso: 'FAV' | 'CDL' | 'PC';
          unidade?: string;
          observacoes?: string;
          aplicada?: boolean;
          data_prescricao: string;
          data_aplicacao?: string;
          prescrito_por: string;
          aplicado_por?: string;
          clinica_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['doses_heparina']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['doses_heparina']['Insert']>;
      };
      historico_alteracoes_dose: {
        Row: {
          id: string;
          dose_heparina_id: string;
          dose_anterior: number;
          dose_nova: number;
          motivo_alteracao: string;
          alterado_por: string;
          data_alteracao?: string;
          aprovado_por?: string;
          status?: string;
          created_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['historico_alteracoes_dose']['Row'], 'id' | 'created_at' | 'data_alteracao'>;
        Update: Partial<Database['public']['Tables']['historico_alteracoes_dose']['Insert']>;
      };
      alertas_heparina: {
        Row: {
          id: string;
          paciente_id: string;
          dose_heparina_id?: string;
          tipo_alerta: 'dose_alta' | 'dose_baixa' | 'tempo_aplicacao' | 'interacao';
          mensagem: string;
          severidade: 'baixa' | 'media' | 'alta' | 'critica';
          ativo?: boolean;
          data_criacao?: string;
          resolvido_em?: string;
          resolvido_por?: string;
          clinica_id: string;
        };
        Insert: Omit<Database['public']['Tables']['alertas_heparina']['Row'], 'id' | 'data_criacao'>;
        Update: Partial<Database['public']['Tables']['alertas_heparina']['Insert']>;
      };
      configuracoes_alerta: {
        Row: {
          id: string;
          clinica_id: string;
          tipo_acesso: 'FAV' | 'CDL' | 'PC';
          dose_minima: number;
          dose_maxima: number;
          tempo_alerta_aplicacao?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['configuracoes_alerta']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['configuracoes_alerta']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Tipos de conveniência
export type Clinica = Database['public']['Tables']['clinicas']['Row'];
export type Paciente = Database['public']['Tables']['pacientes']['Row'];
export type Maquina = Database['public']['Tables']['maquinas']['Row'];
export type Sala = Database['public']['Tables']['salas']['Row'];
export type Turno = Database['public']['Tables']['turnos']['Row'];
export type EscalaPaciente = Database['public']['Tables']['escala_pacientes']['Row'];
export type UsuarioClinica = Database['public']['Tables']['usuarios_clinicas']['Row'];
export type PerfilUsuario = Database['public']['Tables']['perfis_usuarios']['Row'];
export type AcessoVascular = Database['public']['Tables']['acessos_vasculares']['Row'];
export type PrescricaoDialitica = Database['public']['Tables']['prescricoes_dialiticas']['Row'];
export type Serologia = Database['public']['Tables']['serologias']['Row'];
export type DocPaciente = Database['public']['Tables']['docs_paciente']['Row'];
export type AuditLog = Database['public']['Tables']['audit_log']['Row'];
export type SessaoHemodialise = Database['public']['Tables']['sessoes_hemodialise']['Row'];
export type HistoricoAcesso = Database['public']['Tables']['historico_acessos']['Row'];
export type Prescricao = Database['public']['Tables']['prescricoes']['Row'];
export type ExameLaboratorial = Database['public']['Tables']['exames_laboratoriais']['Row'];
export type DoseHeparina = Database['public']['Tables']['doses_heparina']['Row'];
export type HistoricoAlteracaoDose = Database['public']['Tables']['historico_alteracoes_dose']['Row'];
export type AlertaHeparina = Database['public']['Tables']['alertas_heparina']['Row'];
export type ConfiguracaoAlerta = Database['public']['Tables']['configuracoes_alerta']['Row'];

// Tipos para inserção
export type PacienteInsert = Database['public']['Tables']['pacientes']['Insert'];
export type MaquinaInsert = Database['public']['Tables']['maquinas']['Insert'];
export type SalaInsert = Database['public']['Tables']['salas']['Insert'];
export type TurnoInsert = Database['public']['Tables']['turnos']['Insert'];
export type EscalaPacienteInsert = Database['public']['Tables']['escala_pacientes']['Insert'];
export type SessaoHemodialiseInsert = Database['public']['Tables']['sessoes_hemodialise']['Insert'];
export type HistoricoAcessoInsert = Database['public']['Tables']['historico_acessos']['Insert'];
export type PrescricaoInsert = Database['public']['Tables']['prescricoes']['Insert'];
export type ExameLaboratorialInsert = Database['public']['Tables']['exames_laboratoriais']['Insert'];
export type DoseHeparinaInsert = Database['public']['Tables']['doses_heparina']['Insert'];
export type HistoricoAlteracaoDoseInsert = Database['public']['Tables']['historico_alteracoes_dose']['Insert'];
export type AlertaHeparinaInsert = Database['public']['Tables']['alertas_heparina']['Insert'];
export type ConfiguracaoAlertaInsert = Database['public']['Tables']['configuracoes_alerta']['Insert'];

// Tipos para atualização
export type PacienteUpdate = Database['public']['Tables']['pacientes']['Update'];
export type MaquinaUpdate = Database['public']['Tables']['maquinas']['Update'];
export type SalaUpdate = Database['public']['Tables']['salas']['Update'];
export type TurnoUpdate = Database['public']['Tables']['turnos']['Update'];
export type EscalaPacienteUpdate = Database['public']['Tables']['escala_pacientes']['Update'];
export type SessaoHemodialiseUpdate = Database['public']['Tables']['sessoes_hemodialise']['Update'];
export type HistoricoAcessoUpdate = Database['public']['Tables']['historico_acessos']['Update'];
export type PrescricaoUpdate = Database['public']['Tables']['prescricoes']['Update'];
export type ExameLaboratorialUpdate = Database['public']['Tables']['exames_laboratoriais']['Update'];
export type DoseHeparinaUpdate = Database['public']['Tables']['doses_heparina']['Update'];
export type HistoricoAlteracaoDoseUpdate = Database['public']['Tables']['historico_alteracoes_dose']['Update'];
export type AlertaHeparinaUpdate = Database['public']['Tables']['alertas_heparina']['Update'];
export type ConfiguracaoAlertaUpdate = Database['public']['Tables']['configuracoes_alerta']['Update'];