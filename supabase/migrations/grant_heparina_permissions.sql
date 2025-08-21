-- Conceder permissões para as tabelas do módulo heparina

-- Permissões para a role authenticated (usuários logados)
GRANT ALL PRIVILEGES ON doses_heparina TO authenticated;
GRANT ALL PRIVILEGES ON alertas_heparina TO authenticated;
GRANT ALL PRIVILEGES ON historico_alteracoes_dose TO authenticated;
GRANT ALL PRIVILEGES ON configuracoes_alerta TO authenticated;

-- Permissões para a role anon (usuários não logados - apenas leitura se necessário)
GRANT SELECT ON doses_heparina TO anon;
GRANT SELECT ON alertas_heparina TO anon;
GRANT SELECT ON historico_alteracoes_dose TO anon;
GRANT SELECT ON configuracoes_alerta TO anon;

-- Criar políticas RLS básicas para as tabelas do módulo heparina

-- Política para doses_heparina
CREATE POLICY "Usuários autenticados podem acessar doses_heparina" ON doses_heparina
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para alertas_heparina
CREATE POLICY "Usuários autenticados podem acessar alertas_heparina" ON alertas_heparina
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para historico_alteracoes_dose
CREATE POLICY "Usuários autenticados podem acessar historico_alteracoes_dose" ON historico_alteracoes_dose
    FOR ALL USING (auth.role() = 'authenticated');

-- Política para configuracoes_alerta
CREATE POLICY "Usuários autenticados podem acessar configuracoes_alerta" ON configuracoes_alerta
    FOR ALL USING (auth.role() = 'authenticated');