-- Fix infinite recursion in usuarios_clinicas RLS policies
-- Remove problematic policy that causes self-reference

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins podem gerenciar associações de sua clínica" ON usuarios_clinicas;

-- Drop other potentially problematic policies to start fresh
DROP POLICY IF EXISTS "Usuários podem ver relacionamentos da sua clínica" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Users can view their own clinic associations" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem ver suas associações" ON usuarios_clinicas;
DROP POLICY IF EXISTS "Usuários podem inserir suas associações" ON usuarios_clinicas;

-- Create simple, non-recursive policies

-- Policy 1: Users can view their own associations (no recursion)
CREATE POLICY "usuarios_clinicas_select_own" ON usuarios_clinicas
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own associations (no recursion)
CREATE POLICY "usuarios_clinicas_insert_own" ON usuarios_clinicas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own associations (no recursion)
CREATE POLICY "usuarios_clinicas_update_own" ON usuarios_clinicas
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own associations (no recursion)
CREATE POLICY "usuarios_clinicas_delete_own" ON usuarios_clinicas
  FOR DELETE USING (auth.uid() = user_id);

-- Note: Admin management will be handled at application level
-- to avoid RLS recursion issues