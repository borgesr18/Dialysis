-- Migração para Módulo de Gestão de Heparina
-- Criação das tabelas necessárias para controle de doses de heparina

-- Tabela de Doses de Heparina
CREATE TABLE doses_heparina (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    sessao_id UUID REFERENCES sessoes_hemodialise(id),
    dose_heparina DECIMAL(8,2) NOT NULL,
    dose_cateter DECIMAL(8,2),
    tipo_acesso VARCHAR(10) CHECK (tipo_acesso IN ('FAV', 'CDL', 'PC')) NOT NULL,
    unidade VARCHAR(10) DEFAULT 'UI' CHECK (unidade IN ('UI', 'mg')),
    observacoes TEXT,
    aplicada BOOLEAN DEFAULT false,
    data_prescricao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_aplicacao TIMESTAMP WITH TIME ZONE,
    prescrito_por UUID REFERENCES auth.users(id) NOT NULL,
    aplicado_por UUID REFERENCES auth.users(id),
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Histórico de Alterações
CREATE TABLE historico_alteracoes_dose (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dose_heparina_id UUID REFERENCES doses_heparina(id) NOT NULL,
    dose_anterior DECIMAL(8,2) NOT NULL,
    dose_nova DECIMAL(8,2) NOT NULL,
    motivo_alteracao TEXT NOT NULL,
    alterado_por UUID REFERENCES auth.users(id) NOT NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprovado_por UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Alertas de Heparina
CREATE TABLE alertas_heparina (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    dose_heparina_id UUID REFERENCES doses_heparina(id),
    tipo_alerta VARCHAR(50) CHECK (tipo_alerta IN ('dose_alta', 'dose_baixa', 'tempo_aplicacao', 'interacao')) NOT NULL,
    mensagem TEXT NOT NULL,
    severidade VARCHAR(20) CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolvido_em TIMESTAMP WITH TIME ZONE,
    resolvido_por UUID REFERENCES auth.users(id),
    clinica_id UUID REFERENCES clinicas(id) NOT NULL
);

-- Tabela de Configurações de Alerta
CREATE TABLE configuracoes_alerta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID REFERENCES clinicas(id) NOT NULL,
    tipo_acesso VARCHAR(10) CHECK (tipo_acesso IN ('FAV', 'CDL', 'PC')) NOT NULL,
    dose_minima DECIMAL(8,2) NOT NULL,
    dose_maxima DECIMAL(8,2) NOT NULL,
    tempo_alerta_aplicacao INTEGER DEFAULT 30, -- minutos
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinica_id, tipo_acesso)
);

-- Índices para Performance
CREATE INDEX idx_doses_heparina_paciente_id ON doses_heparina(paciente_id);
CREATE INDEX idx_doses_heparina_data_prescricao ON doses_heparina(data_prescricao DESC);
CREATE INDEX idx_doses_heparina_aplicada ON doses_heparina(aplicada);
CREATE INDEX idx_doses_heparina_clinica_id ON doses_heparina(clinica_id);
CREATE INDEX idx_alertas_heparina_ativo ON alertas_heparina(ativo);
CREATE INDEX idx_alertas_heparina_severidade ON alertas_heparina(severidade);
CREATE INDEX idx_historico_alteracoes_dose_id ON historico_alteracoes_dose(dose_heparina_id);

-- Políticas RLS (Row Level Security)
ALTER TABLE doses_heparina ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_alteracoes_dose ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_heparina ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_alerta ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Usuários podem ver doses da sua clínica" ON doses_heparina
    FOR SELECT USING (
        clinica_id IN (
            SELECT clinica_id FROM usuarios_clinicas 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Enfermeiros podem alterar doses" ON doses_heparina
    FOR UPDATE USING (
        clinica_id IN (
            SELECT clinica_id FROM usuarios_clinicas
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Enfermeiros podem inserir doses" ON doses_heparina
    FOR INSERT WITH CHECK (
        clinica_id IN (
            SELECT clinica_id FROM usuarios_clinicas
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem ver alertas da sua clínica" ON alertas_heparina
    FOR SELECT USING (
        clinica_id IN (
            SELECT clinica_id FROM usuarios_clinicas 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Usuários podem ver histórico da sua clínica" ON historico_alteracoes_dose
    FOR SELECT USING (
        dose_heparina_id IN (
            SELECT id FROM doses_heparina 
            WHERE clinica_id IN (
                SELECT clinica_id FROM usuarios_clinicas 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Administradores podem ver configurações" ON configuracoes_alerta
    FOR SELECT USING (
        clinica_id IN (
            SELECT clinica_id FROM usuarios_clinicas 
            WHERE user_id = auth.uid()
        )
    );

-- Permissões para roles anon e authenticated
GRANT SELECT, INSERT, UPDATE ON doses_heparina TO authenticated;
GRANT SELECT, INSERT ON historico_alteracoes_dose TO authenticated;
GRANT SELECT, INSERT, UPDATE ON alertas_heparina TO authenticated;
GRANT SELECT, UPDATE ON configuracoes_alerta TO authenticated;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doses_heparina_updated_at BEFORE UPDATE
    ON doses_heparina FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_alerta_updated_at BEFORE UPDATE
    ON configuracoes_alerta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar alertas automáticos
CREATE OR REPLACE FUNCTION verificar_alertas_dose()
RETURNS TRIGGER AS $$
DECLARE
    config_alerta configuracoes_alerta%ROWTYPE;
    mensagem_alerta TEXT;
    severidade_alerta VARCHAR(20);
BEGIN
    -- Buscar configuração de alerta para o tipo de acesso
    SELECT * INTO config_alerta 
    FROM configuracoes_alerta 
    WHERE clinica_id = NEW.clinica_id 
    AND tipo_acesso = NEW.tipo_acesso 
    AND ativo = true;
    
    IF FOUND THEN
        -- Verificar dose alta
        IF NEW.dose_heparina > config_alerta.dose_maxima THEN
            mensagem_alerta := 'Dose de heparina acima do limite máximo (' || config_alerta.dose_maxima || ' UI)';
            severidade_alerta := 'alta';
            
            INSERT INTO alertas_heparina (
                paciente_id, dose_heparina_id, tipo_alerta, mensagem, 
                severidade, clinica_id
            ) VALUES (
                NEW.paciente_id, NEW.id, 'dose_alta', mensagem_alerta, 
                severidade_alerta, NEW.clinica_id
            );
        END IF;
        
        -- Verificar dose baixa
        IF NEW.dose_heparina < config_alerta.dose_minima THEN
            mensagem_alerta := 'Dose de heparina abaixo do limite mínimo (' || config_alerta.dose_minima || ' UI)';
            severidade_alerta := 'media';
            
            INSERT INTO alertas_heparina (
                paciente_id, dose_heparina_id, tipo_alerta, mensagem, 
                severidade, clinica_id
            ) VALUES (
                NEW.paciente_id, NEW.id, 'dose_baixa', mensagem_alerta, 
                severidade_alerta, NEW.clinica_id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_alertas_dose
    AFTER INSERT OR UPDATE ON doses_heparina
    FOR EACH ROW EXECUTE FUNCTION verificar_alertas_dose();

-- Função para registrar histórico de alterações
CREATE OR REPLACE FUNCTION registrar_historico_dose()
RETURNS TRIGGER AS $$
BEGIN
    -- Só registra se a dose foi alterada
    IF OLD.dose_heparina != NEW.dose_heparina THEN
        INSERT INTO historico_alteracoes_dose (
            dose_heparina_id, dose_anterior, dose_nova, 
            motivo_alteracao, alterado_por
        ) VALUES (
            NEW.id, OLD.dose_heparina, NEW.dose_heparina,
            COALESCE(NEW.observacoes, 'Alteração via sistema'), 
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_historico_dose
    AFTER UPDATE ON doses_heparina
    FOR EACH ROW EXECUTE FUNCTION registrar_historico_dose();

-- Dados iniciais de configuração
INSERT INTO configuracoes_alerta (clinica_id, tipo_acesso, dose_minima, dose_maxima, tempo_alerta_aplicacao)
SELECT 
    c.id,
    acesso.tipo,
    CASE 
        WHEN acesso.tipo = 'FAV' THEN 2000.0
        WHEN acesso.tipo = 'CDL' THEN 1500.0
        WHEN acesso.tipo = 'PC' THEN 1000.0
    END as dose_minima,
    CASE 
        WHEN acesso.tipo = 'FAV' THEN 8000.0
        WHEN acesso.tipo = 'CDL' THEN 6000.0
        WHEN acesso.tipo = 'PC' THEN 4000.0
    END as dose_maxima,
    30 as tempo_alerta_aplicacao
FROM clinicas c
CROSS JOIN (VALUES ('FAV'), ('CDL'), ('PC')) AS acesso(tipo)
WHERE NOT EXISTS (
    SELECT 1 FROM configuracoes_alerta ca 
    WHERE ca.clinica_id = c.id AND ca.tipo_acesso = acesso.tipo
);