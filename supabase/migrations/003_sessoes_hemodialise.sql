-- Migração para Sistema de Gestão de Hemodiálise - Sessões
-- Data: 2024
-- Descrição: Criação das tabelas específicas para controle de sessões de hemodiálise

-- =============================================
-- 1. CRIAÇÃO DAS TABELAS DE SESSÕES
-- =============================================

-- Tabela de Sessões de Hemodiálise
CREATE TABLE IF NOT EXISTS sessoes_hemodialise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    maquina_id UUID NOT NULL REFERENCES maquinas(id),
    data_sessao DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    peso_pre DECIMAL(5,2),
    peso_pos DECIMAL(5,2),
    ultrafiltração_prescrita INTEGER,
    ultrafiltração_realizada INTEGER,
    pressao_arterial_pre VARCHAR(20),
    pressao_arterial_pos VARCHAR(20),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'AGENDADA',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Histórico de Acessos Vasculares
CREATE TABLE IF NOT EXISTS historico_acessos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sessao_id UUID NOT NULL REFERENCES sessoes_hemodialise(id),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    tipo_acesso VARCHAR(50) NOT NULL,
    local_acesso VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Prescrições
CREATE TABLE IF NOT EXISTS prescricoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    medico_responsavel VARCHAR(255),
    tempo_dialise INTEGER NOT NULL,
    fluxo_sangue INTEGER,
    fluxo_dialisato INTEGER,
    ultrafiltração INTEGER,
    anticoagulante VARCHAR(100),
    dose_anticoagulante VARCHAR(50),
    observacoes TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Exames Laboratoriais
CREATE TABLE IF NOT EXISTS exames_laboratoriais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    data_coleta DATE NOT NULL,
    tipo_exame VARCHAR(100) NOT NULL,
    resultado JSONB,
    valores_referencia JSONB,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para Sessões de Hemodiálise
CREATE INDEX IF NOT EXISTS idx_sessoes_paciente_id ON sessoes_hemodialise(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_maquina_id ON sessoes_hemodialise(maquina_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data_sessao ON sessoes_hemodialise(data_sessao DESC);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON sessoes_hemodialise(status);

-- Índices para Histórico de Acessos
CREATE INDEX IF NOT EXISTS idx_historico_acessos_paciente_id ON historico_acessos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historico_acessos_sessao_id ON historico_acessos(sessao_id);

-- Índices para Prescrições
CREATE INDEX IF NOT EXISTS idx_prescricoes_paciente_id ON prescricoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_prescricoes_ativa ON prescricoes(ativa);

-- Índices para Exames
CREATE INDEX IF NOT EXISTS idx_exames_paciente_id ON exames_laboratoriais(paciente_id);
CREATE INDEX IF NOT EXISTS idx_exames_data_coleta ON exames_laboratoriais(data_coleta DESC);

-- =============================================
-- 3. CONFIGURAÇÃO DE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE sessoes_hemodialise ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_acessos ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exames_laboratoriais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para sessoes_hemodialise
CREATE POLICY "Usuários podem ver sessões de sua clínica" ON sessoes_hemodialise
    FOR SELECT USING (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir sessões em sua clínica" ON sessoes_hemodialise
    FOR INSERT WITH CHECK (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar sessões de sua clínica" ON sessoes_hemodialise
    FOR UPDATE USING (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

-- Políticas RLS para historico_acessos
CREATE POLICY "Usuários podem ver histórico de acessos de sua clínica" ON historico_acessos
    FOR SELECT USING (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir histórico de acessos em sua clínica" ON historico_acessos
    FOR INSERT WITH CHECK (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

-- Políticas RLS para prescricoes
CREATE POLICY "Usuários podem ver prescrições de sua clínica" ON prescricoes
    FOR SELECT USING (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir prescrições em sua clínica" ON prescricoes
    FOR INSERT WITH CHECK (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem atualizar prescrições de sua clínica" ON prescricoes
    FOR UPDATE USING (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );



-- Políticas RLS para exames_laboratoriais
CREATE POLICY "Usuários podem ver exames de sua clínica" ON exames_laboratoriais
    FOR SELECT USING (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem inserir exames em sua clínica" ON exames_laboratoriais
    FOR INSERT WITH CHECK (
        paciente_id IN (
            SELECT p.id 
            FROM pacientes p
            JOIN usuarios_clinicas uc ON p.clinica_id = uc.clinica_id
            WHERE uc.user_id = auth.uid()
        )
    );

-- =============================================
-- 4. CONCESSÃO DE PERMISSÕES
-- =============================================

-- Conceder permissões para as roles anon e authenticated
GRANT SELECT, INSERT, UPDATE ON sessoes_hemodialise TO authenticated;
GRANT SELECT, INSERT, UPDATE ON historico_acessos TO authenticated;
GRANT SELECT, INSERT, UPDATE ON prescricoes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON exames_laboratoriais TO authenticated;

-- Permissões básicas para anon (apenas leitura limitada se necessário)
GRANT SELECT ON sessoes_hemodialise TO anon;
GRANT SELECT ON historico_acessos TO anon;
GRANT SELECT ON prescricoes TO anon;
GRANT SELECT ON exames_laboratoriais TO anon;