-- Migração para corrigir a tabela sessoes_hemodialise para o módulo Agenda
-- Adiciona colunas necessárias, corrige relacionamentos e políticas RLS

-- 1. Adicionar coluna clinica_id
ALTER TABLE sessoes_hemodialise 
ADD COLUMN clinica_id UUID;

-- 2. Adicionar coluna turno_id
ALTER TABLE sessoes_hemodialise 
ADD COLUMN turno_id UUID;

-- 3. Renomear coluna data_sessao para data_agendamento
ALTER TABLE sessoes_hemodialise 
RENAME COLUMN data_sessao TO data_agendamento;

-- 4. Atualizar dados existentes com clinica_id baseado no paciente
UPDATE sessoes_hemodialise 
SET clinica_id = p.clinica_id
FROM pacientes p
WHERE sessoes_hemodialise.paciente_id = p.id;

-- 5. Tornar clinica_id NOT NULL após popular os dados
ALTER TABLE sessoes_hemodialise 
ALTER COLUMN clinica_id SET NOT NULL;

-- 6. Adicionar foreign key constraints
ALTER TABLE sessoes_hemodialise 
ADD CONSTRAINT fk_sessoes_clinica 
FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE CASCADE;

ALTER TABLE sessoes_hemodialise 
ADD CONSTRAINT fk_sessoes_turno 
FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL;

-- 7. Criar enum de status e converter coluna
CREATE TYPE status_sessao AS ENUM (
  'agendada',
  'confirmada', 
  'em_andamento',
  'concluida',
  'cancelada'
);

-- Remover valor padrão antes da conversão
ALTER TABLE sessoes_hemodialise 
ALTER COLUMN status DROP DEFAULT;

-- Converter valores existentes para o novo enum
ALTER TABLE sessoes_hemodialise 
ALTER COLUMN status TYPE status_sessao 
USING (
  CASE UPPER(status)
    WHEN 'AGENDADA' THEN 'agendada'::status_sessao
    WHEN 'CONFIRMADA' THEN 'confirmada'::status_sessao
    WHEN 'EM_ANDAMENTO' THEN 'em_andamento'::status_sessao
    WHEN 'CONCLUIDA' THEN 'concluida'::status_sessao
    WHEN 'CANCELADA' THEN 'cancelada'::status_sessao
    ELSE 'agendada'::status_sessao
  END
);

-- Definir novo valor padrão
ALTER TABLE sessoes_hemodialise 
ALTER COLUMN status SET DEFAULT 'agendada'::status_sessao;

-- 8. Remover políticas RLS antigas
DROP POLICY IF EXISTS "Usuários podem ver sessões de suas clínicas" ON sessoes_hemodialise;
DROP POLICY IF EXISTS "Usuários podem inserir sessões em suas clínicas" ON sessoes_hemodialise;
DROP POLICY IF EXISTS "Usuários podem atualizar sessões de suas clínicas" ON sessoes_hemodialise;
DROP POLICY IF EXISTS "Usuários podem deletar sessões de suas clínicas" ON sessoes_hemodialise;

-- 9. Criar novas políticas RLS usando clinica_id diretamente
CREATE POLICY "Usuários podem ver sessões de suas clínicas" ON sessoes_hemodialise
  FOR SELECT USING (
    clinica_id IN (
      SELECT uc.clinica_id 
      FROM usuarios_clinicas uc 
      WHERE uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir sessões em suas clínicas" ON sessoes_hemodialise
  FOR INSERT WITH CHECK (
    clinica_id IN (
      SELECT uc.clinica_id 
      FROM usuarios_clinicas uc 
      WHERE uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar sessões de suas clínicas" ON sessoes_hemodialise
  FOR UPDATE USING (
    clinica_id IN (
      SELECT uc.clinica_id 
      FROM usuarios_clinicas uc 
      WHERE uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar sessões de suas clínicas" ON sessoes_hemodialise
  FOR DELETE USING (
    clinica_id IN (
      SELECT uc.clinica_id 
      FROM usuarios_clinicas uc 
      WHERE uc.user_id = auth.uid()
    )
  );

-- 10. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_sessoes_clinica_id ON sessoes_hemodialise(clinica_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_turno_id ON sessoes_hemodialise(turno_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_data_agendamento ON sessoes_hemodialise(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON sessoes_hemodialise(status);
CREATE INDEX IF NOT EXISTS idx_sessoes_clinica_data ON sessoes_hemodialise(clinica_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_sessoes_paciente_data ON sessoes_hemodialise(paciente_id, data_agendamento);
CREATE INDEX IF NOT EXISTS idx_sessoes_maquina_data ON sessoes_hemodialise(maquina_id, data_agendamento);

-- 11. Comentários para documentação
COMMENT ON COLUMN sessoes_hemodialise.clinica_id IS 'ID da clínica onde a sessão será realizada';
COMMENT ON COLUMN sessoes_hemodialise.turno_id IS 'ID do turno em que a sessão está agendada';
COMMENT ON COLUMN sessoes_hemodialise.data_agendamento IS 'Data do agendamento da sessão';
COMMENT ON COLUMN sessoes_hemodialise.status IS 'Status atual da sessão: agendada, confirmada, em_andamento, concluida, cancelada';