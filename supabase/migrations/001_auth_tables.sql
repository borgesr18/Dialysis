-- Criar tabela de perfis de usuários primeiro (não depende de outras tabelas)
CREATE TABLE IF NOT EXISTS perfis_usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de clínicas
CREATE TABLE IF NOT EXISTS clinicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de associação usuários-clínicas (depende das duas anteriores)
CREATE TABLE IF NOT EXISTS usuarios_clinicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  papel VARCHAR(50) DEFAULT 'user', -- admin, user, viewer
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, clinica_id)
);

-- Adicionar coluna clinica_id às tabelas existentes se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'clinica_id') THEN
    ALTER TABLE pacientes ADD COLUMN clinica_id UUID REFERENCES clinicas(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maquinas' AND column_name = 'clinica_id') THEN
    ALTER TABLE maquinas ADD COLUMN clinica_id UUID REFERENCES clinicas(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salas' AND column_name = 'clinica_id') THEN
    ALTER TABLE salas ADD COLUMN clinica_id UUID REFERENCES clinicas(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'turnos' AND column_name = 'clinica_id') THEN
    ALTER TABLE turnos ADD COLUMN clinica_id UUID REFERENCES clinicas(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'escala_pacientes' AND column_name = 'clinica_id') THEN
    ALTER TABLE escala_pacientes ADD COLUMN clinica_id UUID REFERENCES clinicas(id);
  END IF;
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_clinicas_usuario_id ON usuarios_clinicas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_clinicas_clinica_id ON usuarios_clinicas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica_id ON pacientes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_maquinas_clinica_id ON maquinas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_salas_clinica_id ON salas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_turnos_clinica_id ON turnos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_escala_pacientes_clinica_id ON escala_pacientes(clinica_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_clinicas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clinicas
CREATE POLICY "Usuários podem ver suas clínicas" ON clinicas
  FOR SELECT USING (
    id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Admins podem atualizar suas clínicas" ON clinicas
  FOR UPDATE USING (
    id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND papel = 'admin' AND ativo = true
    )
  );

CREATE POLICY "Usuários podem inserir clínicas" ON clinicas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para perfis_usuarios
CREATE POLICY "Usuários podem ver seu próprio perfil" ON perfis_usuarios
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON perfis_usuarios
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Usuários podem inserir seu próprio perfil" ON perfis_usuarios
  FOR INSERT WITH CHECK (id = auth.uid());

-- Políticas RLS para usuarios_clinicas
CREATE POLICY "Usuários podem ver suas associações" ON usuarios_clinicas
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas associações" ON usuarios_clinicas
  FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins podem gerenciar associações de sua clínica" ON usuarios_clinicas
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND papel = 'admin' AND ativo = true
    )
  );

-- Atualizar políticas RLS das tabelas existentes para incluir clinica_id
DROP POLICY IF EXISTS "Usuários podem ver pacientes de sua clínica" ON pacientes;
CREATE POLICY "Usuários podem ver pacientes de sua clínica" ON pacientes
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar pacientes de sua clínica" ON pacientes;
CREATE POLICY "Usuários podem gerenciar pacientes de sua clínica" ON pacientes
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Políticas similares para outras tabelas
DROP POLICY IF EXISTS "Usuários podem ver máquinas de sua clínica" ON maquinas;
CREATE POLICY "Usuários podem ver máquinas de sua clínica" ON maquinas
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar máquinas de sua clínica" ON maquinas;
CREATE POLICY "Usuários podem gerenciar máquinas de sua clínica" ON maquinas
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem ver salas de sua clínica" ON salas;
CREATE POLICY "Usuários podem ver salas de sua clínica" ON salas
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar salas de sua clínica" ON salas;
CREATE POLICY "Usuários podem gerenciar salas de sua clínica" ON salas
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem ver turnos de sua clínica" ON turnos;
CREATE POLICY "Usuários podem ver turnos de sua clínica" ON turnos
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar turnos de sua clínica" ON turnos;
CREATE POLICY "Usuários podem gerenciar turnos de sua clínica" ON turnos
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem ver escalas de sua clínica" ON escala_pacientes;
CREATE POLICY "Usuários podem ver escalas de sua clínica" ON escala_pacientes
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar escalas de sua clínica" ON escala_pacientes;
CREATE POLICY "Usuários podem gerenciar escalas de sua clínica" ON escala_pacientes
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE usuario_id = auth.uid() AND ativo = true
    )
  );

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis_usuarios (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();