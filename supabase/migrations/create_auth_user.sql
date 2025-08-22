-- Criar usuário de teste no Supabase Auth
-- IMPORTANTE: Este é um método para desenvolvimento/teste apenas

-- Inserir usuário na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'teste.crud@exemplo.com',
  '$2a$10$8K1p/a0dhrxSHxN2LOjOe.T7.gUarS2dzNvzKdqh67VhSJVyBJHsG', -- senha: 123456
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Inserir identidade na tabela auth.identities
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  '{"sub": "f47ac10b-58cc-4372-a567-0e02b2c3d480", "email": "teste.crud@exemplo.com"}',
  'email',
  'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;