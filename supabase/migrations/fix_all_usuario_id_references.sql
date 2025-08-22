-- Fix all references to 'usuario_id' in RLS policies
-- The table usuarios_clinicas uses 'user_id' but policies reference 'usuario_id'
-- Also remove references to non-existent columns 'ativo' and 'papel'

-- Drop and recreate all policies that reference usuarios_clinicas with correct column name

-- Políticas para clinicas
DROP POLICY IF EXISTS "Usuários podem ver suas clínicas" ON clinicas;
CREATE POLICY "Usuários podem ver suas clínicas" ON clinicas
  FOR SELECT USING (
    id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins podem atualizar suas clínicas" ON clinicas;
CREATE POLICY "Admins podem atualizar suas clínicas" ON clinicas
  FOR UPDATE USING (
    id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para pacientes
DROP POLICY IF EXISTS "Usuários podem ver pacientes de sua clínica" ON pacientes;
CREATE POLICY "Usuários podem ver pacientes de sua clínica" ON pacientes
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar pacientes de sua clínica" ON pacientes;
CREATE POLICY "Usuários podem gerenciar pacientes de sua clínica" ON pacientes
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para maquinas
DROP POLICY IF EXISTS "Usuários podem ver máquinas de sua clínica" ON maquinas;
CREATE POLICY "Usuários podem ver máquinas de sua clínica" ON maquinas
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar máquinas de sua clínica" ON maquinas;
CREATE POLICY "Usuários podem gerenciar máquinas de sua clínica" ON maquinas
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para salas
DROP POLICY IF EXISTS "Usuários podem ver salas de sua clínica" ON salas;
CREATE POLICY "Usuários podem ver salas de sua clínica" ON salas
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar salas de sua clínica" ON salas;
CREATE POLICY "Usuários podem gerenciar salas de sua clínica" ON salas
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para turnos
DROP POLICY IF EXISTS "Usuários podem ver turnos de sua clínica" ON turnos;
CREATE POLICY "Usuários podem ver turnos de sua clínica" ON turnos
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar turnos de sua clínica" ON turnos;
CREATE POLICY "Usuários podem gerenciar turnos de sua clínica" ON turnos
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

-- Políticas para escala_pacientes
DROP POLICY IF EXISTS "Usuários podem ver escalas de sua clínica" ON escala_pacientes;
CREATE POLICY "Usuários podem ver escalas de sua clínica" ON escala_pacientes
  FOR SELECT USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários podem gerenciar escalas de sua clínica" ON escala_pacientes;
CREATE POLICY "Usuários podem gerenciar escalas de sua clínica" ON escala_pacientes
  FOR ALL USING (
    clinica_id IN (
      SELECT clinica_id FROM usuarios_clinicas 
      WHERE user_id = auth.uid()
    )
  );