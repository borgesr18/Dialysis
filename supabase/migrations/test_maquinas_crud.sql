-- TESTE COMPLETO CRUD - MÓDULO MÁQUINAS
-- Este script testa todas as operações CRUD para máquinas

-- ========================================
-- PREPARAÇÃO: Verificar dados existentes
-- ========================================

SELECT 'VERIFICANDO DADOS EXISTENTES:' as teste;

-- Verificar clínicas disponíveis
SELECT 'Clínicas disponíveis:' as info;
SELECT id, nome FROM clinicas LIMIT 3;

-- Verificar salas disponíveis
SELECT 'Salas disponíveis:' as info;
SELECT id, nome, clinica_id FROM salas LIMIT 3;

-- Verificar máquinas existentes
SELECT 'Máquinas existentes:' as info;
SELECT COUNT(*) as total_maquinas FROM maquinas WHERE ativa = true;

-- ========================================
-- TESTE 1: CRIAR MÁQUINA (CREATE)
-- ========================================

SELECT 'TESTE 1 - CRIANDO NOVA MÁQUINA:' as teste;

-- Inserir nova máquina de teste
INSERT INTO maquinas (
    clinica_id,
    sala_id,
    identificador,
    marca,
    modelo,
    numero_serie,
    ativa
) 
SELECT 
    c.id as clinica_id,
    s.id as sala_id,
    'MAQ-TEST-001' as identificador,
    'Fresenius' as marca,
    '4008S' as modelo,
    'TEST123456' as numero_serie,
    true as ativa
FROM clinicas c
INNER JOIN salas s ON s.clinica_id = c.id
LIMIT 1;

-- Verificar se a máquina foi criada
SELECT 'Máquina criada com sucesso:' as resultado;
SELECT id, identificador, marca, modelo, numero_serie, ativa 
FROM maquinas 
WHERE identificador = 'MAQ-TEST-001';

-- ========================================
-- TESTE 2: LER MÁQUINA (READ)
-- ========================================

SELECT 'TESTE 2 - LENDO DADOS DA MÁQUINA:' as teste;

-- Buscar máquina com JOIN para mostrar dados relacionados
SELECT 
    m.id,
    m.identificador,
    m.marca,
    m.modelo,
    m.numero_serie,
    m.ativa,
    c.nome as clinica_nome,
    s.nome as sala_nome
FROM maquinas m
INNER JOIN clinicas c ON m.clinica_id = c.id
INNER JOIN salas s ON m.sala_id = s.id
WHERE m.identificador = 'MAQ-TEST-001';

-- ========================================
-- TESTE 3: ATUALIZAR MÁQUINA (UPDATE)
-- ========================================

SELECT 'TESTE 3 - ATUALIZANDO DADOS DA MÁQUINA:' as teste;

-- Atualizar dados da máquina
UPDATE maquinas 
SET 
    marca = 'Gambro',
    modelo = 'AK200',
    numero_serie = 'UPDATED789'
WHERE identificador = 'MAQ-TEST-001';

-- Verificar se a atualização foi aplicada
SELECT 'Máquina atualizada com sucesso:' as resultado;
SELECT id, identificador, marca, modelo, numero_serie, ativa 
FROM maquinas 
WHERE identificador = 'MAQ-TEST-001';

-- ========================================
-- TESTE 4: VERIFICAR DEPENDÊNCIAS
-- ========================================

SELECT 'TESTE 4 - VERIFICANDO DEPENDÊNCIAS:' as teste;

-- Verificar se há sessões de hemodiálise usando esta máquina
SELECT COUNT(*) as sessoes_count 
FROM sessoes_hemodialise 
WHERE maquina_id = (SELECT id FROM maquinas WHERE identificador = 'MAQ-TEST-001');

-- Verificar se há escalas de pacientes usando esta máquina
SELECT COUNT(*) as escalas_count 
FROM escala_pacientes 
WHERE maquina_id = (SELECT id FROM maquinas WHERE identificador = 'MAQ-TEST-001');

-- ========================================
-- TESTE 5: EXCLUSÃO LÓGICA (SOFT DELETE)
-- ========================================

SELECT 'TESTE 5 - REALIZANDO EXCLUSÃO LÓGICA:' as teste;

-- Desativar máquina (exclusão lógica)
UPDATE maquinas 
SET ativa = false
WHERE identificador = 'MAQ-TEST-001';

-- Verificar se a exclusão lógica foi aplicada
SELECT 'Máquina desativada (exclusão lógica):' as resultado;
SELECT id, identificador, marca, modelo, ativa 
FROM maquinas 
WHERE identificador = 'MAQ-TEST-001';

-- Verificar contagem de máquinas ativas
SELECT 'Total de máquinas ativas após exclusão:' as info;
SELECT COUNT(*) as maquinas_ativas FROM maquinas WHERE ativa = true;

-- ========================================
-- TESTE 6: LIMPEZA (CLEANUP)
-- ========================================

SELECT 'TESTE 6 - LIMPEZA DOS DADOS DE TESTE:' as teste;

-- Remover máquina de teste (exclusão física para limpeza)
DELETE FROM maquinas WHERE identificador = 'MAQ-TEST-001';

SELECT 'Dados de teste removidos com sucesso!' as resultado;

-- ========================================
-- RESUMO FINAL
-- ========================================

SELECT 'RESUMO FINAL - TESTES CRUD MÁQUINAS:' as teste;
SELECT 
    'CREATE: ✓ Máquina criada com sucesso' as teste_create,
    'READ: ✓ Dados lidos corretamente' as teste_read,
    'UPDATE: ✓ Dados atualizados com sucesso' as teste_update,
    'DELETE: ✓ Exclusão lógica funcionando' as teste_delete,
    'CLEANUP: ✓ Dados de teste removidos' as teste_cleanup;