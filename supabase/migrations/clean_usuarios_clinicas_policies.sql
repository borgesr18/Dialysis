-- Clean all policies for usuarios_clinicas and create only necessary ones
-- This migration removes ALL existing policies and creates clean, simple ones

-- Drop ALL existing policies for usuarios_clinicas
DROP POLICY IF EXISTS "Usuários podem ver relacionamentos da sua clínica" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem ver suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem inserir suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Admins podem gerenciar associações de sua clínica" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_basic_access" ON usuarios_clinicas;

-- Create clean, simple policies that don't cause recursion
CREATE POLICY "usuarios_clinicas_select_clean" ON usuarios_clinicas
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "usuarios_clinicas_insert_clean" ON usuarios_clinicas
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "usuarios_clinicas_update_clean" ON usuarios_clinicas
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "usuarios_clinicas_delete_clean" ON usuarios_clinicas
  FOR DELETE USING (user_id = auth.uid());