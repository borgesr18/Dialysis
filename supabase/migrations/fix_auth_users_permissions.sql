-- Corrigir permissões para a tabela auth.users
-- O erro 'permission denied for table users' indica que as políticas RLS
-- estão tentando acessar auth.users sem as permissões adequadas

-- Garantir que os roles anon e authenticated tenham acesso à tabela auth.users
-- quando necessário para as políticas RLS
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON auth.users TO anon, authenticated;

-- Recriar as políticas RLS para usuarios_clinicas de forma mais simples
-- para evitar problemas de permissão
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem ver suas associações" ON usuarios_clinicas;

CREATE POLICY "Users can view their own clinic associations" ON usuarios_clinicas
  FOR SELECT
  USING (user_id = auth.uid());

-- Simplificar a política de pacientes para evitar subqueries complexas
DROP POLICY IF EXISTS "Usuários podem ver pacientes de sua clínica" ON pacientes;
CREATE POLICY "Usuários podem ver pacientes de sua clínica" ON pacientes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_clinicas uc 
      WHERE uc.user_id = auth.uid() 
      AND uc.clinica_id = pacientes.clinica_id
    )
  );