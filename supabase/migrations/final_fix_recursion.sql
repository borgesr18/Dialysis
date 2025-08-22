-- Final fix for infinite recursion in usuarios_clinicas policies
-- Remove the problematic policy that causes recursion

-- Drop the problematic policy that references usuarios_clinicas within itself
DROP POLICY IF EXISTS "Admins podem gerenciar associações de sua clínica" ON usuarios_clinicas;

-- Also drop any other policies that might reference non-existent columns
DROP POLICY IF EXISTS "Usuários podem ver suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem inserir suas associações" ON usuarios_clinicas;

-- Create simple, non-recursive policies for usuarios_clinicas
CREATE POLICY "usuarios_clinicas_select_simple" ON usuarios_clinicas
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "usuarios_clinicas_insert_simple" ON usuarios_clinicas
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "usuarios_clinicas_update_simple" ON usuarios_clinicas
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "usuarios_clinicas_delete_simple" ON usuarios_clinicas
  FOR DELETE USING (user_id = auth.uid());