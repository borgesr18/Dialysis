-- 008_admin_config_fields.sql
-- Adicionar colunas faltantes em clinicas para Configura 7f5es da clínica
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clinicas' AND column_name='uf'
  ) THEN
    ALTER TABLE clinicas ADD COLUMN uf VARCHAR(2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clinicas' AND column_name='fuso_horario'
  ) THEN
    ALTER TABLE clinicas ADD COLUMN fuso_horario TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='clinicas' AND column_name='observacoes'
  ) THEN
    ALTER TABLE clinicas ADD COLUMN observacoes TEXT;
  END IF;
END $$;