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

// Configurar cliente Supabase com SERVICE_ROLE_KEY para contornar RLS
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function seedData() {
  try {
    console.log('🌱 Iniciando inserção de dados de exemplo...');
    
    // 1. Criar clínica
    console.log('\n1. Criando clínica...');
    const { data: clinica, error: erroClinica } = await supabase
      .from('clinicas')
      .insert({
        nome: 'Clínica Renal São Paulo'
      })
      .select()
      .single();
    
    if (erroClinica) {
      console.error('Erro ao criar clínica:', erroClinica);
      return;
    }
    console.log(`✅ Clínica criada: ${clinica.nome}`);
    
    // 2. Criar salas
    console.log('\n2. Criando salas...');
    const salasData = [
      { nome: 'Sala A', descricao: 'Sala de hemodiálise A', clinica_id: clinica.id },
      { nome: 'Sala B', descricao: 'Sala de hemodiálise B', clinica_id: clinica.id },
      { nome: 'Sala C', descricao: 'Sala de hemodiálise C', clinica_id: clinica.id }
    ];
    
    const { data: salas, error: erroSalas } = await supabase
      .from('salas')
      .insert(salasData)
      .select();
    
    if (erroSalas) {
      console.error('Erro ao criar salas:', erroSalas);
      return;
    }
    console.log(`✅ ${salas.length} salas criadas`);
    
    // 3. Criar turnos
    console.log('\n3. Criando turnos...');
    const turnosData = [
      { 
        nome: 'Manhã', 
        hora_inicio: '07:00', 
        hora_fim: '13:00',
        clinica_id: clinica.id
      },
      { 
        nome: 'Tarde', 
        hora_inicio: '13:00', 
        hora_fim: '19:00',
        clinica_id: clinica.id
      },
      { 
        nome: 'Noite', 
        hora_inicio: '19:00', 
        hora_fim: '01:00',
        clinica_id: clinica.id
      }
    ];
    
    const { data: turnos, error: erroTurnos } = await supabase
      .from('turnos')
      .insert(turnosData)
      .select();
    
    if (erroTurnos) {
      console.error('Erro ao criar turnos:', erroTurnos);
      return;
    }
    console.log(`✅ ${turnos.length} turnos criados`);
    
    // 4. Criar máquinas
    console.log('\n4. Criando máquinas...');
    const maquinasData = [];
    salas.forEach((sala, salaIndex) => {
      for (let i = 1; i <= 5; i++) {
        maquinasData.push({
          identificador: `MAQ${String.fromCharCode(65 + salaIndex)}${i.toString().padStart(2, '0')}`,
          sala_id: sala.id,
          marca: 'Fresenius',
          modelo: '4008S',
          numero_serie: `FS${salaIndex + 1}${i.toString().padStart(3, '0')}`,
          ativa: true,
          clinica_id: clinica.id
        });
      }
    });
    
    const { data: maquinas, error: erroMaquinas } = await supabase
      .from('maquinas')
      .insert(maquinasData)
      .select();
    
    if (erroMaquinas) {
      console.error('Erro ao criar máquinas:', erroMaquinas);
      return;
    }
    console.log(`✅ ${maquinas.length} máquinas criadas`);
    
    // 5. Criar pacientes primeiro
    console.log('\n5. Criando pacientes...');
    const pacientesData = [
       {
         nome_completo: 'João Silva Santos',
         registro: 'REG001',
         data_nascimento: '1980-05-15',
         sexo: 'M',
         telefone: '(11) 98765-4321',
         cidade_nome: 'São Paulo',
         codigo_ibge: 3550308,
         ativo: true,
         clinica_id: clinica.id
       },
       {
         nome_completo: 'Maria Oliveira Costa',
         registro: 'REG002',
         data_nascimento: '1975-08-22',
         sexo: 'F',
         telefone: '(11) 87654-3210',
         cidade_nome: 'São Paulo',
         codigo_ibge: 3550308,
         ativo: true,
         clinica_id: clinica.id
       },
       {
         nome_completo: 'Pedro Souza Lima',
         registro: 'REG003',
         data_nascimento: '1965-12-10',
         sexo: 'M',
         telefone: '(11) 76543-2109',
         cidade_nome: 'São Paulo',
         codigo_ibge: 3550308,
         ativo: true,
         clinica_id: clinica.id
       }
     ];
    
    const { data: pacientes, error: erroPacientes } = await supabase
      .from('pacientes')
      .insert(pacientesData)
      .select();
    
    if (erroPacientes) {
      console.error('Erro ao criar pacientes:', erroPacientes);
      return;
    }
    console.log(`✅ ${pacientes.length} pacientes criados`);
    
    // 6. Criar acessos vasculares para os pacientes
     console.log('\n6. Criando acessos vasculares...');
     const acessosData = [
       {
         paciente_id: pacientes[0].id,
         tipo_acesso: 'Fístula Arteriovenosa',
         calibre_agulha: '15G',
         lado: 'ESQUERDO',
         data_implante: '2024-01-15',
         ativo: true
       },
       {
         paciente_id: pacientes[1].id,
         tipo_acesso: 'Cateter Duplo Lúmen',
         local_cateter: 'Jugular Direita',
         data_implante: '2024-02-10',
         ativo: true
       },
       {
         paciente_id: pacientes[2].id,
         tipo_acesso: 'Enxerto Arteriovenoso',
         calibre_agulha: '14G',
         lado: 'DIREITO',
         data_implante: '2024-01-20',
         ativo: true
       }
     ];

     const { data: acessosVasculares, error: erroAcessos } = await supabase
       .from('acessos_vasculares')
       .insert(acessosData)
       .select();
     
     if (erroAcessos) {
       console.error('Erro ao criar acessos vasculares:', erroAcessos);
       return;
     }
     console.log(`✅ ${acessosVasculares.length} acessos vasculares criados`);
    
    // 7. Criar escala de pacientes
    console.log('\n7. Criando escala de pacientes...');
    const escalaData = [];
    
    pacientes.forEach((paciente, index) => {
      const sala = salas[index % salas.length];
      const turno = turnos[index % turnos.length];
      const maquina = maquinas.find(m => m.sala_id === sala.id);
      
      escalaData.push({
        clinica_id: clinica.id,
        paciente_id: paciente.id,
        sala_id: sala.id,
        turno_id: turno.id,
        maquina_id: maquina?.id || null,
        dias_semana: index % 2 === 0 ? [1, 3, 5] : [2, 4, 6],
        observacoes: `Escala regular para ${paciente.nome_completo}`
      });
    });
    
    const { data: escala, error: erroEscala } = await supabase
      .from('escala_pacientes')
      .insert(escalaData)
      .select();
    
    if (erroEscala) {
      console.error('Erro ao criar escala:', erroEscala);
      return;
    }
    console.log(`✅ ${escala.length} registros de escala criados`);
    
    // 8. Dados criados com sucesso!
    console.log('\n✅ Todos os dados básicos foram criados com sucesso!');
    
    console.log('\n🎉 Dados de exemplo criados com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`- 1 clínica`);
    console.log(`- ${salas.length} salas`);
    console.log(`- ${turnos.length} turnos`);
    console.log(`- ${maquinas.length} máquinas`);
    console.log(`- ${acessosVasculares.length} acessos vasculares`);
    console.log(`- ${pacientes.length} pacientes`);
    console.log(`- ${escala.length} registros de escala`);
    
    console.log('\n✅ Agora você pode acessar a tela de lançamento de heparina!');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

seedData();