-- Fix column name inconsistencies in usuarios_clinicas policies
-- The table uses 'user_id' but policies were created with 'usuario_id'

-- Drop all existing policies for usuarios_clinicas to start fresh
DROP POLICY IF EXISTS "Usuários podem ver suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem inserir suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Admins podem gerenciar associações de sua clínica" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_own" ON usuarios_clinicas;

-- Create new policies with correct column names (user_id instead of usuario_id)
CREATE POLICY "usuarios_clinicas_select" ON usuarios_clinicas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usuarios_clinicas_insert" ON usuarios_clinicas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_clinicas_update" ON usuarios_clinicas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "usuarios_clinicas_delete" ON usuarios_clinicas
  FOR DELETE USING (auth.uid() = user_id);

-- Note: Removed admin policy that caused recursion
-- Admin functionality will be handled at application level