-- Atualizar a senha do usuário de teste usando a função de hash do Supabase
UPDATE auth.users 
SET 
    encrypted_password = crypt('123456', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'teste.crud@exemplo.com';

-- Verificar se a atualização foi bem-sucedida
SELECT 
    id,
    email,
    email_confirmed_at,
    encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'teste.crud@exemplo.com';