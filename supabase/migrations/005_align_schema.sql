-- 005_align_schema.sql
-- Alinhar schema com o código

-- 1) Renomear coluna usuario_id -> user_id (se existir)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='usuarios_clinicas' AND column_name='usuario_id'
  ) THEN
    ALTER TABLE usuarios_clinicas RENAME COLUMN usuario_id TO user_id;
  END IF;
END $$;

-- 2) Remover colunas não utilizadas em usuarios_clinicas (papel, ativo), se existirem
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='usuarios_clinicas' AND column_name='papel'
  ) THEN
    ALTER TABLE usuarios_clinicas DROP COLUMN papel;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='usuarios_clinicas' AND column_name='ativo'
  ) THEN
    ALTER TABLE usuarios_clinicas DROP COLUMN ativo;
  END IF;
END $$;

-- 3) Garantir UNIQUE(user_id, clinica_id)
DO $$ BEGIN
  -- Remove constraint com nome desconhecido e recria com nome consistente
  BEGIN
    ALTER TABLE usuarios_clinicas DROP CONSTRAINT usuarios_clinicas_usuario_id_clinica_id_key;
  EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN
    ALTER TABLE usuarios_clinicas DROP CONSTRAINT usuarios_clinicas_user_id_clinica_id_key;
  EXCEPTION WHEN undefined_object THEN NULL; END;
  ALTER TABLE usuarios_clinicas ADD CONSTRAINT usuarios_clinicas_user_clinica_key UNIQUE (user_id, clinica_id);
END $$;

-- 4) Recriar políticas simples coerentes com user_id
DO $$ BEGIN
  -- Apagar políticas existentes
  PERFORM 1; -- no-op
END $$;

DROP POLICY IF EXISTS "usuarios_clinicas_select" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_simple" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_select_clean" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_insert_clean" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_update_clean" ON usuarios_clinicas;
DROP POLICY IF EXISTS "usuarios_clinicas_delete_clean" ON usuarios_clinicas;

CREATE POLICY "usuarios_clinicas_select" ON usuarios_clinicas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usuarios_clinicas_insert" ON usuarios_clinicas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usuarios_clinicas_update" ON usuarios_clinicas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "usuarios_clinicas_delete" ON usuarios_clinicas
  FOR DELETE USING (auth.uid() = user_id);

-- 5) Opcional: adicionar coluna 'papel' em perfis_usuarios, se desejado pelo app
--    Caso não deseje, remova o uso no código. Mantemos aqui como opcional (comentado).
-- DO $$ BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns 
--     WHERE table_name='perfis_usuarios' AND column_name='papel'
--   ) THEN
--     ALTER TABLE perfis_usuarios ADD COLUMN papel VARCHAR(50);
--   END IF;
-- END $$;

-- 6) Garantir índices em usuarios_clinicas com user_id
CREATE INDEX IF NOT EXISTS idx_usuarios_clinicas_user_id ON usuarios_clinicas(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_clinicas_clinica_id ON usuarios_clinicas(clinica_id);