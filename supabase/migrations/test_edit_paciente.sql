-- TESTE DE EDIÇÃO DE PACIENTE
-- 1. Verificar se existe algum paciente para editar
SELECT 'VERIFICANDO PACIENTES EXISTENTES:' as teste;
SELECT id, nome_completo, registro, telefone, cidade_nome, clinica_id 
FROM pacientes 
WHERE ativo = true
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Se não houver pacientes, criar um para teste
SELECT 'CRIANDO PACIENTE PARA TESTE DE EDIÇÃO:' as teste;
INSERT INTO pacientes (
    nome_completo, 
    registro, 
    data_nascimento, 
    telefone, 
    cidade_nome, 
    clinica_id
) 
SELECT 
    'João Silva Teste Edição',
    'EDIT001',
    '1975-03-20',
    '(81) 99999-1111',
    'Recife',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE NOT EXISTS (
    SELECT 1 FROM pacientes 
    WHERE registro = 'EDIT001' 
    AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
)
RETURNING id, nome_completo, registro;

-- 3. Verificar paciente criado/existente
SELECT 'PACIENTE DISPONÍVEL PARA EDIÇÃO:' as teste;
SELECT id, nome_completo, registro, telefone, cidade_nome 
FROM pacientes 
WHERE registro = 'EDIT001' 
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 4. Simular edição - atualizar dados do paciente
SELECT 'TESTANDO EDIÇÃO - ATUALIZANDO DADOS:' as teste;
UPDATE pacientes 
SET 
    telefone = '(81) 88888-2222',
    cidade_nome = 'Olinda',
    alerta_texto = 'Paciente hipertenso - monitorar pressão',
    updated_at = NOW()
WHERE registro = 'EDIT001'
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
RETURNING id, nome_completo, telefone, cidade_nome, alerta_texto;

-- 5. Verificar se a edição foi aplicada
SELECT 'VERIFICANDO EDIÇÃO APLICADA:' as teste;
SELECT id, nome_completo, registro, telefone, cidade_nome, alerta_texto, updated_at 
FROM pacientes 
WHERE registro = 'EDIT001'
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 6. Contar total de pacientes ativos
SELECT 'TOTAL DE PACIENTES ATIVOS:' as teste;
SELECT COUNT(*) as total_pacientes_ativos 
FROM pacientes 
WHERE ativo = true 
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';