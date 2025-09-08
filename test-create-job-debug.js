// Script para depurar a criação de vagas
require('dotenv').config({ path: '.env.local' });
// Importação correta do node-fetch para versões mais recentes do Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configurações
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USER = {
  email: 'empresa@teste.com',
  password: 'Teste@123',
  type: 'empresa'
};

// Função para fazer login e obter token
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

// Função para obter o ID da empresa
async function getCompanyId(token) {
  try {
    console.log('\nBuscando ID da empresa...');
    
    const response = await fetch(`${API_URL}/companies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Resposta da API companies:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data.length > 0) {
      const company = data.data.find(c => c.email === USER.email);
      if (company) {
        console.log('✅ ID da empresa encontrado:', company._id);
        console.log('Detalhes do plano:', JSON.stringify(company.plan, null, 2));
        return company._id;
      }
    }
    
    console.log('❌ Empresa não encontrada');
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    return null;
  }
}

// Função para criar uma vaga de emprego
async function createJob(token, companyId, userId) {
  try {
    console.log('\nCriando vaga de emprego simplificada...');
    
    const jobData = {
      companyId: companyId,
      title: 'Desenvolvedor Web Junior',
      description: 'Vaga para desenvolvedor web júnior.',
      summary: 'Vaga para desenvolvedor web júnior com conhecimentos básicos em HTML, CSS e JavaScript.',
      location: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        isRemote: false,
        remoteOptions: 'on_site'
      },
      workType: 'full_time',
      workSchedule: 'standard',
      salary: {
        min: 3000,
        max: 4000,
        currency: 'BRL',
        isNegotiable: false,
        paymentFrequency: 'monthly'
      },
      requirements: {
        education: {
          level: 'bachelor',
          required: false
        },
        experience: {
          minYears: 0,
          level: 'entry',
          required: false
        },
        skills: {
          technical: ['HTML', 'CSS', 'JavaScript'],
          soft: ['Comunicação'],
          languages: [
            {
              language: 'Português',
              level: 'native',
              required: true
            }
          ]
        }
      },
      status: 'active',
      priority: 'medium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'technology',
      createdBy: userId
    };
    
    console.log('Enviando dados da vaga:', JSON.stringify(jobData, null, 2));
    
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    // Exibir status HTTP
    console.log('Status HTTP:', response.status);
    
    const data = await response.json();
    console.log('Resposta completa da API:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Vaga criada com sucesso!');
      return data.data;
    } else {
      console.log('❌ Falha ao criar vaga:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao criar vaga:', error);
    return null;
  }
}

// Função principal para executar os testes
async function runTests() {
  console.log('🔍 Iniciando teste de criação de vaga com debug...');
  console.log('API URL:', API_URL);
  
  // Fazer login
  const auth = await login();
  if (!auth) {
    console.log('❌ Não foi possível continuar sem autenticação');
    return;
  }
  
  // Obter ID da empresa
  const companyId = await getCompanyId(auth.token);
  if (!companyId) {
    console.log('❌ Não foi possível continuar sem o ID da empresa');
    return;
  }
  
  // Criar vaga
  const job = await createJob(auth.token, companyId, auth.userId);
  if (job) {
    console.log('\n✨ Teste concluído com sucesso!');
  } else {
    console.log('\n❌ Teste falhou');
  }
}

// Executar testes
runTests(); 