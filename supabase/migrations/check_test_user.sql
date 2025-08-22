-- Verificar se o usuário de teste existe e suas informações
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    p.nome,
    p.papel
FROM auth.users u
LEFT JOIN public.perfis_usuarios p ON u.id = p.id
WHERE u.email = 'teste.crud@exemplo.com';

-- Verificar associação com clínica
SELECT 
    uc.user_id,
    uc.clinica_id,
    c.nome as clinica_nome
FROM public.usuarios_clinicas uc
JOIN public.clinicas c ON uc.clinica_id = c.id
JOIN auth.users u ON uc.user_id = u.id
WHERE u.email = 'teste.crud@exemplo.com';