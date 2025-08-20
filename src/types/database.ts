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
          cidade_nome?: string;
          uf?: string;
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
          nome_completo: string;
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
          serie?: string;
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
          nome: string;
          tipo: string;
          url: string;
          tamanho?: number;
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

// Tipos para inserção
export type PacienteInsert = Database['public']['Tables']['pacientes']['Insert'];
export type MaquinaInsert = Database['public']['Tables']['maquinas']['Insert'];
export type SalaInsert = Database['public']['Tables']['salas']['Insert'];
export type TurnoInsert = Database['public']['Tables']['turnos']['Insert'];
export type EscalaPacienteInsert = Database['public']['Tables']['escala_pacientes']['Insert'];

// Tipos para atualização
export type PacienteUpdate = Database['public']['Tables']['pacientes']['Update'];
export type MaquinaUpdate = Database['public']['Tables']['maquinas']['Update'];
export type SalaUpdate = Database['public']['Tables']['salas']['Update'];
export type TurnoUpdate = Database['public']['Tables']['turnos']['Update'];
export type EscalaPacienteUpdate = Database['public']['Tables']['escala_pacientes']['Update'];