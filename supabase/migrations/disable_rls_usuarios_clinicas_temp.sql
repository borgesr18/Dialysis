-- Temporarily disable RLS on usuarios_clinicas to break recursion
-- This table will be accessed directly by other policies without RLS checks

-- Disable RLS on usuarios_clinicas to break the recursion cycle
ALTER TABLE usuarios_clinicas DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since RLS is disabled
DROP POLICY IF EXISTS "usuarios_clinicas_select_clean" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_clean" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_clean" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_clean" ON usuarios_clinicas;

-- Grant necessary permissions to roles since RLS is disabled
GRANT SELECT ON usuarios_clinicas TO authenticated;
GRANT INSERT ON usuarios_clinicas TO authenticated;
GRANT UPDATE ON usuarios_clinicas TO authenticated;
GRANT DELETE ON usuarios_clinicas TO authenticated;

-- Note: With RLS disabled, the application logic must ensure
-- that users only access their own clinic associations