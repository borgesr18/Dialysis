-- TESTE DE EXCLUSÃO DE PACIENTE
-- 1. Verificar pacientes disponíveis para exclusão
SELECT 'VERIFICANDO PACIENTES DISPONÍVEIS PARA EXCLUSÃO:' as teste;
SELECT id, nome_completo, registro, telefone, cidade_nome 
FROM pacientes 
WHERE ativo = true
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Criar um paciente específico para teste de exclusão
SELECT 'CRIANDO PACIENTE PARA TESTE DE EXCLUSÃO:' as teste;
INSERT INTO pacientes (
    nome_completo, 
    registro, 
    data_nascimento, 
    telefone, 
    cidade_nome, 
    clinica_id
) 
SELECT 
    'Maria Santos Teste Exclusão',
    'DEL001',
    '1980-07-15',
    '(81) 77777-3333',
    'Jaboatão dos Guararapes',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'
WHERE NOT EXISTS (
    SELECT 1 FROM pacientes 
    WHERE registro = 'DEL001' 
    AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
)
RETURNING id, nome_completo, registro;

-- 3. Verificar se o paciente tem dependências (sessões de hemodiálise)
SELECT 'VERIFICANDO DEPENDÊNCIAS - SESSÕES DE HEMODIÁLISE:' as teste;
SELECT COUNT(*) as total_sessoes
FROM sessoes_hemodialise hs
INNER JOIN pacientes p ON hs.paciente_id = p.id
WHERE p.registro = 'DEL001'
AND p.clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 4. Simular exclusão lógica (marcar como inativo)
SELECT 'TESTANDO EXCLUSÃO LÓGICA - MARCANDO COMO INATIVO:' as teste;
UPDATE pacientes 
SET 
    ativo = false,
    updated_at = NOW()
WHERE registro = 'DEL001'
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
AND ativo = true
RETURNING id, nome_completo, registro, ativo;

-- 5. Verificar se a exclusão lógica foi aplicada
SELECT 'VERIFICANDO EXCLUSÃO LÓGICA APLICADA:' as teste;
SELECT id, nome_completo, registro, ativo, updated_at 
FROM pacientes 
WHERE registro = 'DEL001'
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 6. Verificar que o paciente não aparece mais na lista de ativos
SELECT 'VERIFICANDO QUE PACIENTE NÃO APARECE NA LISTA DE ATIVOS:' as teste;
SELECT COUNT(*) as pacientes_ativos_com_registro_del001
FROM pacientes 
WHERE registro = 'DEL001'
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
AND ativo = true;

-- 7. Contar total de pacientes ativos após exclusão
SELECT 'TOTAL DE PACIENTES ATIVOS APÓS EXCLUSÃO:' as teste;
SELECT COUNT(*) as total_pacientes_ativos 
FROM pacientes 
WHERE ativo = true 
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- 8. Teste adicional: Tentar excluir paciente que não existe
SELECT 'TESTE: TENTATIVA DE EXCLUSÃO DE PACIENTE INEXISTENTE:' as teste;
UPDATE pacientes 
SET ativo = false
WHERE registro = 'INEXISTENTE999'
AND clinica_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

SELECT 'RESULTADO: Nenhuma linha afetada (esperado)' as resultado;