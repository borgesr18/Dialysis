-- Adicionar campos faltantes na tabela pacientes
ALTER TABLE pacientes 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS convenio TEXT,
ADD COLUMN IF NOT EXISTS numero_convenio TEXT;

-- Adicionar comentários para documentação
COMMENT ON COLUMN pacientes.cpf IS 'CPF do paciente';
COMMENT ON COLUMN pacientes.endereco IS 'Endereço completo do paciente';
COMMENT ON COLUMN pacientes.convenio IS 'Nome do convênio médico';
COMMENT ON COLUMN pacientes.numero_convenio IS 'Número da carteirinha do convênio';