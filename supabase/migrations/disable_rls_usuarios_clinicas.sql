-- Temporarily disable RLS on usuarios_clinicas to stop infinite recursion
-- Then re-enable with very simple policies

-- Disable RLS completely
ALTER TABLE usuarios_clinicas DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Usuários podem ver suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem inserir suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Admins podem gerenciar associações de sua clínica" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_own" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_simple" ON usuarios_clinicas;

-- Re-enable RLS
ALTER TABLE usuarios_clinicas ENABLE ROW LEVEL SECURITY;

-- Create ONE simple policy for now
CREATE POLICY "usuarios_clinicas_basic_access" ON usuarios_clinicas
  FOR ALL USING (user_id = auth.uid());