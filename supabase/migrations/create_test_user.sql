-- Criar usuário de teste
-- Primeiro, vamos inserir na tabela auth.users (simulando um usuário autenticado)
-- Nota: Em produção, isso seria feito através do Supabase Auth

-- Inserir clínica de teste
INSERT INTO clinicas (id, nome, created_at, updated_at) 
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Clínica Teste CRUD',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Inserir perfil de usuário de teste
INSERT INTO perfis_usuarios (id, nome, papel, created_at, updated_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'Usuário Teste CRUD',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Associar usuário à clínica
INSERT INTO usuarios_clinicas (user_id, clinica_id, created_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  NOW()
) ON CONFLICT (user_id, clinica_id) DO NOTHING;

-- Inserir alguns pacientes de teste para testar CRUD
INSERT INTO pacientes (
  id,
  clinica_id,
  registro,
  nome_completo,
  data_nascimento,
  sexo,
  telefone,
  cidade_nome,
  ativo,
  created_at,
  updated_at
) VALUES 
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'PAC001',
  'João Silva Teste',
  '1980-01-15',
  'M',
  '(11) 99999-9999',
  'São Paulo',
  true,
  NOW(),
  NOW()
),
(
  'b2c3d4e5-f6a7-4901-bcde-f23456789012',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'PAC002',
  'Maria Santos Teste',
  '1975-05-20',
  'F',
  '(11) 88888-8888',
  'São Paulo',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;