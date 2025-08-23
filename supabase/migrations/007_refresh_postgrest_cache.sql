-- 007_refresh_postgrest_cache.sql
-- Forçar recarregamento do cache de schema do PostgREST e garantir trigger de updated_at

-- Recriar (idempotente) função de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir que a coluna updated_at exista em maquinas (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='maquinas' AND column_name='updated_at'
  ) THEN
    ALTER TABLE maquinas ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Garantir trigger em maquinas (idempotente)
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

-- No-op que altera metadados para forçar invalidação de cache
COMMENT ON TABLE maquinas IS 'Tabela de máquinas - atualizado em ' || NOW();

-- Opcional: sinalizar PostgREST para recarregar schema (se extension pgrst estiver disponível)
DO $$ BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
EXCEPTION WHEN OTHERS THEN
  -- ignora se canal não existir
  PERFORM 1;
END $$;