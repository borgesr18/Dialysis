-- TESTE COMPLETO DO MÓDULO PACIENTES
-- 1. Verificar pacientes existentes
SELECT 'PACIENTES EXISTENTES:' as teste;
SELECT id, nome_completo, registro, data_nascimento, telefone, clinica_id 
FROM pacientes 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Criar novo paciente de teste
SELECT 'CRIANDO NOVO PACIENTE:' as teste;
INSERT INTO pacientes (
    nome_completo, 
    registro, 
    data_nascimento, 
    telefone, 
    cidade_nome, 
    clinica_id
) VALUES (
    'Paciente Teste CRUD',
    'TEST001',
    '1980-05-15',
    '(11) 99999-9999',
    'São Paulo',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
) RETURNING id, nome_completo, registro;

-- 3. Verificar se o paciente foi criado
SELECT 'PACIENTE CRIADO:' as teste;
SELECT id, nome_completo, registro, telefone 
FROM pacientes 
WHERE nome_completo = 'Paciente Teste CRUD';

-- 4. Atualizar o paciente criado
SELECT 'ATUALIZANDO PACIENTE:' as teste;
UPDATE pacientes 
SET 
    telefone = '(11) 88888-8888',
    cidade_nome = 'Rio de Janeiro',
    updated_at = NOW()
WHERE nome_completo = 'Paciente Teste CRUD'
RETURNING id, nome_completo, telefone, cidade_nome;

-- 5. Verificar a atualização
SELECT 'PACIENTE ATUALIZADO:' as teste;
SELECT id, nome_completo, telefone, cidade_nome, updated_at 
FROM pacientes 
WHERE nome_completo = 'Paciente Teste CRUD';

-- 6. Contar total de pacientes
SELECT 'TOTAL DE PACIENTES:' as teste;
SELECT COUNT(*) as total_pacientes FROM pacientes;

-- 7. Excluir o paciente de teste
SELECT 'EXCLUINDO PACIENTE DE TESTE:' as teste;
DELETE FROM pacientes 
WHERE nome_completo = 'Paciente Teste CRUD'
RETURNING id, nome_completo;

-- 8. Verificar se foi excluído
SELECT 'VERIFICANDO EXCLUSÃO:' as teste;
SELECT COUNT(*) as pacientes_teste_restantes 
FROM pacientes 
WHERE nome_completo = 'Paciente Teste CRUD';

-- 9. Verificar integridade dos dados
SELECT 'VERIFICAÇÃO FINAL:' as teste;
SELECT 
    COUNT(*) as total_pacientes,
    COUNT(DISTINCT clinica_id) as clinicas_com_pacientes
FROM pacientes;