-- Completar setup do usuário de teste
-- Criar perfil e associar à clínica

-- Inserir perfil do usuário
INSERT INTO perfis_usuarios (
  id,
  nome,
  papel,
  created_at,
  updated_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'Usuario Teste CRUD',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  papel = EXCLUDED.papel,
  updated_at = NOW();

-- Associar usuário à clínica de teste
INSERT INTO usuarios_clinicas (
  user_id,
  clinica_id,
  created_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  NOW()
) ON CONFLICT (user_id, clinica_id) DO NOTHING;