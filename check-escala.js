const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Ler variáveis do .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/"/g, '');
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTabelas() {
  try {
    console.log('Verificando dados nas tabelas relacionadas...');
    
    // Verificar pacientes
    const { data: pacientes, error: erroPacientes } = await supabase
      .from('pacientes')
      .select('id, nome_completo, registro')
      .limit(5);
    
    console.log(`\nPacientes (${pacientes?.length || 0}):`);
    if (pacientes && pacientes.length > 0) {
      pacientes.forEach(p => console.log(`- ${p.nome_completo} (${p.registro})`));
    } else {
      console.log('Nenhum paciente encontrado');
    }
    
    // Verificar salas
    const { data: salas, error: erroSalas } = await supabase
      .from('salas')
      .select('id, nome')
      .limit(5);
    
    console.log(`\nSalas (${salas?.length || 0}):`);
    if (salas && salas.length > 0) {
      salas.forEach(s => console.log(`- ${s.nome}`));
    } else {
      console.log('Nenhuma sala encontrada');
    }
    
    // Verificar turnos
    const { data: turnos, error: erroTurnos } = await supabase
      .from('turnos')
      .select('id, nome, hora_inicio, hora_fim')
      .limit(5);
    
    console.log(`\nTurnos (${turnos?.length || 0}):`);
    if (turnos && turnos.length > 0) {
      turnos.forEach(t => console.log(`- ${t.nome} (${t.hora_inicio} - ${t.hora_fim})`));
    } else {
      console.log('Nenhum turno encontrado');
    }
    
    // Verificar máquinas
    const { data: maquinas, error: erroMaquinas } = await supabase
      .from('maquinas')
      .select('id, identificador, sala_id')
      .limit(5);
    
    console.log(`\nMáquinas (${maquinas?.length || 0}):`);
    if (maquinas && maquinas.length > 0) {
      maquinas.forEach(m => console.log(`- ${m.identificador}`));
    } else {
      console.log('Nenhuma máquina encontrada');
    }
    
    // Verificar clínicas
    const { data: clinicas, error: erroClinicas } = await supabase
      .from('clinicas')
      .select('id, nome')
      .limit(5);
    
    console.log(`\nClínicas (${clinicas?.length || 0}):`);
    if (clinicas && clinicas.length > 0) {
      clinicas.forEach(c => console.log(`- ${c.nome}`));
    } else {
      console.log('Nenhuma clínica encontrada');
    }
    
    // Se temos dados básicos, criar alguns registros de exemplo na escala_pacientes
    if (pacientes && pacientes.length > 0 && salas && salas.length > 0 && turnos && turnos.length > 0 && clinicas && clinicas.length > 0) {
      console.log('\n=== CRIANDO DADOS DE EXEMPLO NA ESCALA_PACIENTES ===');
      
      const registrosExemplo = [];
      
      // Criar registros para os primeiros pacientes
      for (let i = 0; i < Math.min(3, pacientes.length); i++) {
        const paciente = pacientes[i];
        const sala = salas[i % salas.length];
        const turno = turnos[i % turnos.length];
        const clinica = clinicas[0];
        
        registrosExemplo.push({
          clinica_id: clinica.id,
          paciente_id: paciente.id,
          sala_id: sala.id,
          turno_id: turno.id,
          maquina_id: maquinas && maquinas.length > 0 ? maquinas[i % maquinas.length].id : null,
          dias_semana: ['SEG', 'QUA', 'SEX'], // Segunda, Quarta, Sexta
          observacao: `Escala de exemplo para ${paciente.nome_completo}`
        });
      }
      
      const { data: novosRegistros, error: erroInsert } = await supabase
        .from('escala_pacientes')
        .insert(registrosExemplo)
        .select();
      
      if (erroInsert) {
        console.error('Erro ao inserir registros de exemplo:', erroInsert);
      } else {
        console.log(`${novosRegistros?.length || 0} registros de exemplo criados com sucesso!`);
      }
    } else {
      console.log('\n⚠️  Não é possível criar dados de exemplo - faltam dados básicos nas tabelas.');
      console.log('Você precisa cadastrar pacientes, salas, turnos e clínicas primeiro.');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkTabelas();