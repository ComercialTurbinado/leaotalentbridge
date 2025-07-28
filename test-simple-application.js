// Script para testar a criação de uma candidatura simples
require('dotenv').config({ path: '.env.local' });
// Importação correta do node-fetch para versões mais recentes do Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configurações
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USER = {
  email: 'candidato@teste.com',
  password: 'Teste@123',
  type: 'candidato'
};

// Função para fazer login como candidato
async function login() {
  try {
    console.log(`\nFazendo login como ${USER.email}...`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(USER)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login bem-sucedido!');
      return { token: data.token, userId: data.user.id };
    } else {
      console.log('❌ Falha no login:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return null;
  }
}

// Função para listar vagas ativas
async function getActiveJobs() {
  try {
    console.log('\nBuscando vagas ativas...');
    
    const response = await fetch(`${API_URL}/jobs?status=active&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      console.log(`✅ ${data.data.length} vagas encontradas`);
      data.data.forEach((job, index) => {
        console.log(`   ${index + 1}. ${job.title} (ID: ${job._id})`);
      });
      return data.data[0]._id; // Retorna o ID da primeira vaga
    } else {
      console.log('❌ Nenhuma vaga encontrada');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar vagas:', error);
    return null;
  }
}

// Função para criar uma candidatura
async function createApplication(token, jobId) {
  try {
    console.log(`\nCriando candidatura para a vaga ${jobId}...`);
    
    const applicationData = {
      jobId: jobId,
      coverLetter: 'Olá, tenho interesse nesta vaga e acredito que meu perfil se encaixa bem com os requisitos mencionados.',
      communicationPreference: 'email'
    };
    
    console.log('Dados da candidatura:', applicationData);
    
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationData)
    });
    
    // Exibir status HTTP
    console.log('Status HTTP:', response.status);
    
    const data = await response.json();
    console.log('Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Candidatura criada com sucesso!');
      return data.data;
    } else {
      console.log('❌ Falha ao criar candidatura:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar candidatura:', error);
    return null;
  }
}

// Função principal
async function runTest() {
  console.log('🧪 Iniciando teste de candidatura simples...');
  
  // Fazer login como candidato
  const auth = await login();
  if (!auth) {
    console.log('❌ Não foi possível continuar sem autenticação');
    return;
  }
  
  // Obter ID de uma vaga ativa
  const jobId = await getActiveJobs();
  if (!jobId) {
    console.log('❌ Não foi possível continuar sem ID de vaga');
    return;
  }
  
  // Criar candidatura
  const application = await createApplication(auth.token, jobId);
  if (application) {
    console.log('\n✨ Teste concluído com sucesso!');
  } else {
    console.log('\n❌ Teste falhou');
  }
}

// Executar teste
runTest(); 