-- Verificar permissões das tabelas de autenticação
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
    AND table_name IN ('clinicas', 'perfis_usuarios', 'usuarios_clinicas') 
ORDER BY table_name, grantee;

-- Garantir permissões para as tabelas de autenticação
GRANT SELECT ON clinicas TO anon;
GRANT ALL PRIVILEGES ON clinicas TO authenticated;

GRANT SELECT ON perfis_usuarios TO anon;
GRANT ALL PRIVILEGES ON perfis_usuarios TO authenticated;

GRANT SELECT ON usuarios_clinicas TO anon;
GRANT ALL PRIVILEGES ON usuarios_clinicas TO authenticated;

-- Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('clinicas', 'perfis_usuarios', 'usuarios_clinicas');