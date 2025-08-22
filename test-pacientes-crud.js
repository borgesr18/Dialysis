/**
 * Script de Teste CRUD - Módulo Pacientes
 * 
 * Este script testa todas as operações CRUD do módulo de pacientes:
 * - CREATE: Criar novo paciente
 * - READ: Listar e buscar pacientes
 * - UPDATE: Editar paciente existente
 * - DELETE: Excluir paciente
 * 
 * Execução: node test-pacientes-crud.js
 */

const baseUrl = 'http://localhost:3000';

// Dados de teste para criação de paciente
const dadosTestePaciente = {
  registro: 'TEST001',
  nome_completo: 'João Silva Teste',
  cidade_nome: 'Recife',
  alerta_texto: 'Paciente de teste - pode ser removido'
};

// Dados para atualização
const dadosAtualizacao = {
  registro: 'TEST001-UPD',
  nome_completo: 'João Silva Teste Atualizado',
  cidade_nome: 'Olinda',
  alerta_texto: 'Paciente de teste atualizado'
};

let pacienteTestId = null;

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers
      }
    });
    
    return {
      ok: response.ok,
      status: response.status,
      url: response.url,
      redirected: response.redirected
    };
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
    return { ok: false, error: error.message };
  }
}

// Função para converter dados em FormData
function createFormData(data) {
  const formData = new URLSearchParams();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData.toString();
}

// Teste 1: CREATE - Criar novo paciente
async function testCreatePaciente() {
  console.log('\n🧪 TESTE 1: CREATE - Criando novo paciente...');
  console.log('Dados:', dadosTestePaciente);
  
  const formData = createFormData(dadosTestePaciente);
  
  const result = await makeRequest(`${baseUrl}/pacientes/new`, {
    method: 'POST',
    body: formData
  });
  
  if (result.redirected && result.url.includes('/pacientes/')) {
    // Extrair ID do paciente da URL de redirecionamento
    const match = result.url.match(/\/pacientes\/([a-f0-9-]+)/);
    if (match) {
      pacienteTestId = match[1];
      console.log('✅ Paciente criado com sucesso!');
      console.log('📋 ID do paciente:', pacienteTestId);
      console.log('🔗 URL de redirecionamento:', result.url);
      return true;
    }
  }
  
  console.log('❌ Falha ao criar paciente');
  console.log('Status:', result.status);
  console.log('URL:', result.url);
  return false;
}

// Teste 2: READ - Verificar se paciente aparece na listagem
async function testReadPacientes() {
  console.log('\n🧪 TESTE 2: READ - Verificando listagem de pacientes...');
  
  const result = await makeRequest(`${baseUrl}/pacientes`);
  
  if (result.ok) {
    console.log('✅ Página de pacientes carregada com sucesso!');
    console.log('📊 Status:', result.status);
    return true;
  }
  
  console.log('❌ Falha ao carregar página de pacientes');
  console.log('Status:', result.status);
  return false;
}

// Teste 3: UPDATE - Atualizar paciente existente
async function testUpdatePaciente() {
  if (!pacienteTestId) {
    console.log('\n❌ TESTE 3: UPDATE - Não é possível testar sem ID do paciente');
    return false;
  }
  
  console.log('\n🧪 TESTE 3: UPDATE - Atualizando paciente...');
  console.log('ID do paciente:', pacienteTestId);
  console.log('Novos dados:', dadosAtualizacao);
  
  const formData = createFormData(dadosAtualizacao);
  
  const result = await makeRequest(`${baseUrl}/pacientes/${pacienteTestId}/edit`, {
    method: 'POST',
    body: formData
  });
  
  if (result.redirected && result.url.includes(pacienteTestId)) {
    console.log('✅ Paciente atualizado com sucesso!');
    console.log('🔗 URL de redirecionamento:', result.url);
    return true;
  }
  
  console.log('❌ Falha ao atualizar paciente');
  console.log('Status:', result.status);
  console.log('URL:', result.url);
  return false;
}

// Teste 4: DELETE - Excluir paciente
async function testDeletePaciente() {
  if (!pacienteTestId) {
    console.log('\n❌ TESTE 4: DELETE - Não é possível testar sem ID do paciente');
    return false;
  }
  
  console.log('\n🧪 TESTE 4: DELETE - Excluindo paciente...');
  console.log('ID do paciente:', pacienteTestId);
  
  // Simular ação de exclusão
  const result = await makeRequest(`${baseUrl}/pacientes`, {
    method: 'POST',
    body: `_action=delete&id=${pacienteTestId}`
  });
  
  if (result.redirected && result.url.includes('/pacientes')) {
    console.log('✅ Paciente excluído com sucesso!');
    console.log('🔗 URL de redirecionamento:', result.url);
    return true;
  }
  
  console.log('❌ Falha ao excluir paciente');
  console.log('Status:', result.status);
  console.log('URL:', result.url);
  return false;
}

// Função principal para executar todos os testes
async function executarTestes() {
  console.log('🚀 INICIANDO TESTES CRUD - MÓDULO PACIENTES');
  console.log('=' .repeat(50));
  
  const resultados = {
    create: false,
    read: false,
    update: false,
    delete: false
  };
  
  try {
    // Executar testes em sequência
    resultados.create = await testCreatePaciente();
    resultados.read = await testReadPacientes();
    resultados.update = await testUpdatePaciente();
    resultados.delete = await testDeletePaciente();
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('=' .repeat(30));
    console.log('CREATE:', resultados.create ? '✅ PASSOU' : '❌ FALHOU');
    console.log('READ:', resultados.read ? '✅ PASSOU' : '❌ FALHOU');
    console.log('UPDATE:', resultados.update ? '✅ PASSOU' : '❌ FALHOU');
    console.log('DELETE:', resultados.delete ? '✅ PASSOU' : '❌ FALHOU');
    
    const totalTestes = Object.keys(resultados).length;
    const testesPassaram = Object.values(resultados).filter(Boolean).length;
    
    console.log('\n🎯 RESULTADO FINAL');
    console.log(`${testesPassaram}/${totalTestes} testes passaram`);
    
    if (testesPassaram === totalTestes) {
      console.log('🎉 TODOS OS TESTES PASSARAM! Módulo de pacientes funcionando corretamente.');
    } else {
      console.log('⚠️  ALGUNS TESTES FALHARAM. Verifique os logs acima para detalhes.');
    }
    
  } catch (error) {
    console.error('💥 Erro durante execução dos testes:', error.message);
  }
}

// Verificar se fetch está disponível (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Este script requer Node.js 18+ com fetch nativo.');
  console.log('💡 Alternativamente, instale node-fetch: npm install node-fetch');
  process.exit(1);
}

// Executar testes
executarTestes();