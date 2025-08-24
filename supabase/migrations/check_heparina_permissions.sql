-- Verificar permissões atuais das tabelas do módulo Heparina
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('doses_heparina', 'alertas_heparina', 'historico_alteracoes_dose', 'configuracoes_alerta') 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Conceder permissões necessárias para o role anon (leitura básica)
GRANT SELECT ON doses_heparina TO anon;
GRANT SELECT ON alertas_heparina TO anon;
GRANT SELECT ON historico_alteracoes_dose TO anon;
GRANT SELECT ON configuracoes_alerta TO anon;

-- Conceder permissões completas para o role authenticated
GRANT ALL PRIVILEGES ON doses_heparina TO authenticated;
GRANT ALL PRIVILEGES ON alertas_heparina TO authenticated;
GRANT ALL PRIVILEGES ON historico_alteracoes_dose TO authenticated;
GRANT ALL PRIVILEGES ON configuracoes_alerta TO authenticated;

-- Verificar permissões após a configuração
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('doses_heparina', 'alertas_heparina', 'historico_alteracoes_dose', 'configuracoes_alerta') 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;