-- Verificar permissões das tabelas do módulo heparina
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('doses_heparina', 'alertas_heparina', 'historico_alteracoes_dose', 'configuracoes_alerta') 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Verificar políticas RLS existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('doses_heparina', 'alertas_heparina', 'historico_alteracoes_dose', 'configuracoes_alerta')
ORDER BY tablename, policyname;