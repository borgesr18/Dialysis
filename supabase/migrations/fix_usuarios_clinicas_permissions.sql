-- Verificar e corrigir permissões da tabela usuarios_clinicas

-- Garantir que a tabela usuarios_clinicas tenha as permissões corretas
GRANT SELECT ON usuarios_clinicas TO authenticated;
GRANT SELECT ON usuarios_clinicas TO anon;

-- Criar política RLS para permitir que usuários vejam apenas seus próprios vínculos
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON usuarios_clinicas;

CREATE POLICY "Users can view their own clinic associations" ON usuarios_clinicas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Verificar se existe alguma política que está causando o erro
-- e garantir que não há referências incorretas à tabela users