-- 006_fix_maquinas_timestamps.sql
-- Garantir colunas de timestamp em maquinas e trigger de updated_at

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='maquinas' AND column_name='created_at'
  ) THEN
    ALTER TABLE maquinas ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='maquinas' AND column_name='updated_at'
  ) THEN
    ALTER TABLE maquinas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Função genérica para atualizar updated_at, reutiliza se já existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se ainda não existir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_maquinas_updated_at'
  ) THEN
    CREATE TRIGGER update_maquinas_updated_at
    BEFORE UPDATE ON maquinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;