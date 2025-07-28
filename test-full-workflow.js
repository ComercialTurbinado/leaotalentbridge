// Script para testar o fluxo completo da ferramenta
require('dotenv').config({ path: '.env.local' });
// Importação correta do node-fetch para versões mais recentes do Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configurações
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USERS = {
  empresa: {
    email: 'empresa@teste.com',
    password: 'Teste@123',
    type: 'empresa'
  },
  admin: {
    email: 'admin@teste.com',
    password: 'Teste@123',
    type: 'admin'
  },
  candidato: {
    email: 'candidato@teste.com',
    password: 'Teste@123',
    type: 'candidato'
  }
};

// Armazenar dados entre as etapas do teste
const testData = {
  tokens: {},
  userIds: {},
  companyId: null,
  jobId: null,
  applicationId: null
};

// Função para fazer login e obter token
async function login(userType) {
  const user = USERS[userType];
  try {
    console.log(`\n🔑 Fazendo login como ${user.email} (${user.type})...`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login bem-sucedido!');
      testData.tokens[userType] = data.token;
      testData.userIds[userType] = data.user.id;
      return true;
    } else {
      console.log('❌ Falha no login:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return false;
  }
}

// Função para obter o ID da empresa
async function getCompanyId() {
  try {
    console.log('\n🏢 Buscando ID da empresa...');
    
    const response = await fetch(`${API_URL}/companies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testData.tokens.empresa}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const company = data.data.find(c => c.email === USERS.empresa.email);
      if (company) {
        console.log('✅ ID da empresa encontrado:', company._id);
        testData.companyId = company._id;
        return true;
      }
    }
    
    console.log('❌ Empresa não encontrada');
    return false;
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    return false;
  }
}

// Função para criar uma vaga de emprego
async function createJob() {
  try {
    console.log('\n📝 Criando vaga de emprego...');
    
    const jobData = {
      companyId: testData.companyId,
      title: 'Desenvolvedor Full Stack React/Node',
      description: 'Estamos procurando um desenvolvedor Full Stack com experiência em React, Node.js e MongoDB para trabalhar em projetos inovadores. O candidato ideal deve ter conhecimento sólido em JavaScript moderno e experiência com desenvolvimento de APIs RESTful.',
      summary: 'Vaga para desenvolvedor Full Stack com experiência em React, Node.js e MongoDB.',
      department: 'Tecnologia',
      location: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        isRemote: true,
        remoteOptions: 'hybrid'
      },
      workType: 'full_time',
      workSchedule: 'flexible',
      salary: {
        min: 6000,
        max: 12000,
        currency: 'BRL',
        isNegotiable: true,
        paymentFrequency: 'monthly',
        benefits: [
          'Vale Refeição',
          'Plano de Saúde',
          'Vale Transporte',
          'Gympass'
        ]
      },
      requirements: {
        education: {
          level: 'bachelor',
          field: 'Ciência da Computação ou áreas relacionadas',
          required: false
        },
        experience: {
          minYears: 2,
          maxYears: 5,
          level: 'mid',
          required: true
        },
        skills: {
          technical: [
            'React',
            'Node.js',
            'MongoDB',
            'TypeScript',
            'Git'
          ],
          soft: [
            'Comunicação',
            'Trabalho em equipe',
            'Resolução de problemas'
          ],
          languages: [
            {
              language: 'Português',
              level: 'native',
              required: true
            },
            {
              language: 'Inglês',
              level: 'intermediate',
              required: true
            }
          ]
        }
      },
      status: 'active',
      priority: 'medium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias a partir de hoje
      applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias a partir de hoje
      startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias a partir de hoje
      maxApplications: 50,
      autoScreening: true,
      questionsRequired: true,
      customQuestions: [
        {
          question: 'Qual sua experiência com React?',
          type: 'text',
          required: true
        },
        {
          question: 'Você tem disponibilidade para trabalhar presencialmente 2 dias por semana?',
          type: 'boolean',
          required: true
        }
      ],
      tags: ['react', 'node.js', 'mongodb', 'typescript', 'full-stack'],
      category: 'technology',
      createdBy: testData.userIds.empresa
    };
    
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.tokens.empresa}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Vaga criada com sucesso!');
      console.log(`   Título: ${data.data.title}`);
      console.log(`   ID: ${data.data._id}`);
      console.log(`   Status: ${data.data.status}`);
      testData.jobId = data.data._id;
      return true;
    } else {
      console.log('❌ Falha ao criar vaga:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao criar vaga:', error);
    return false;
  }
}

// Função para listar vagas
async function listJobs() {
  try {
    console.log('\n📋 Listando vagas disponíveis...');
    
    const response = await fetch(`${API_URL}/jobs?status=active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${data.data.length} vagas encontradas`);
      data.data.forEach(job => {
        console.log(`   - ${job.title} (${job.location.city}, ${job.location.country})`);
      });
      return true;
    } else {
      console.log('❌ Falha ao listar vagas:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao listar vagas:', error);
    return false;
  }
}

// Função para verificar se já existe candidatura
async function checkExistingApplication(token, jobId) {
  try {
    console.log(`\n🔍 Verificando se já existe candidatura para a vaga ${jobId}...`);
    
    const response = await fetch(`${API_URL}/applications?jobId=${jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      // Procura candidatura do usuário atual para esta vaga
      const existingApplication = data.data.find(app => app.jobId?._id === jobId);
      
      if (existingApplication) {
        console.log('ℹ️ Já existe uma candidatura para esta vaga');
        return existingApplication._id;
      }
    }
    
    console.log('✅ Nenhuma candidatura existente encontrada');
    return null;
  } catch (error) {
    console.error('❌ Erro ao verificar candidaturas existentes:', error);
    return null;
  }
}

// Etapa 6: Submeter candidatura
async function applyForJob() {
  try {
    console.log('\n📨 Submetendo candidatura para a vaga...');
    
    // Verificar se já existe candidatura
    const existingApplicationId = await checkExistingApplication(testData.tokens.candidato, testData.jobId);
    
    if (existingApplicationId) {
      console.log('✅ Usando candidatura existente!');
      testData.applicationId = existingApplicationId;
      return true;
    }
    
    const applicationData = {
      jobId: testData.jobId,
      userId: testData.userIds.candidato,
      resume: 'https://example.com/resume.pdf', // URL fictícia para teste
      coverLetter: 'Olá, gostaria de me candidatar para esta posição. Tenho experiência em desenvolvimento web e acredito que meu perfil se encaixa com o que vocês procuram.',
      questionsAnswers: [
        {
          question: 'Qual sua experiência com React?',
          answer: 'Tenho 3 anos de experiência trabalhando com React em projetos comerciais.'
        },
        {
          question: 'Você tem disponibilidade para trabalhar presencialmente 2 dias por semana?',
          answer: 'Sim'
        }
      ],
      status: 'pending'
    };
    
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.tokens.candidato}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Candidatura enviada com sucesso!');
      console.log(`   ID da candidatura: ${data.data._id}`);
      testData.applicationId = data.data._id;
      return true;
    } else {
      console.log('❌ Falha ao enviar candidatura:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar candidatura:', error);
    return false;
  }
}

// Função para listar candidaturas
async function listApplications() {
  try {
    console.log('\n👥 Listando candidaturas para a vaga...');
    
    const response = await fetch(`${API_URL}/applications?jobId=${testData.jobId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testData.tokens.empresa}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${data.data.length} candidaturas encontradas`);
      data.data.forEach(application => {
        console.log(`   - ID: ${application._id}, Status: ${application.status}`);
      });
      return true;
    } else {
      console.log('❌ Falha ao listar candidaturas:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao listar candidaturas:', error);
    return false;
  }
}

// Função principal para executar os testes
async function runTests() {
  console.log('🚀 Iniciando testes de fluxo completo...');
  console.log('API URL:', API_URL);
  
  // Etapa 1: Login como empresa
  if (!await login('empresa')) {
    console.log('❌ Não foi possível continuar: falha no login como empresa');
    return;
  }
  
  // Etapa 2: Obter ID da empresa
  if (!await getCompanyId()) {
    console.log('❌ Não foi possível continuar: falha ao obter ID da empresa');
    return;
  }
  
  // Etapa 3: Criar vaga
  if (!await createJob()) {
    console.log('❌ Não foi possível continuar: falha na criação da vaga');
    return;
  }
  
  // Etapa 4: Listar vagas
  if (!await listJobs()) {
    console.log('❌ Não foi possível continuar: falha ao listar vagas');
    return;
  }
  
  // Etapa 5: Login como candidato
  if (!await login('candidato')) {
    console.log('❌ Não foi possível continuar: falha no login como candidato');
    return;
  }
  
  // Etapa 6: Submeter candidatura
  if (!await applyForJob()) {
    console.log('❌ Não foi possível continuar: falha ao submeter candidatura');
    return;
  }
  
  // Etapa 7: Login como admin
  if (!await login('admin')) {
    console.log('❌ Não foi possível continuar: falha no login como admin');
    return;
  }
  
  // Etapa 8: Listar candidaturas como empresa
  if (!await listApplications()) {
    console.log('❌ Não foi possível continuar: falha ao listar candidaturas');
    return;
  }
  
  console.log('\n✨ Todos os testes foram concluídos com sucesso!');
  console.log('Este é um resumo dos IDs gerados durante o teste:');
  console.log('- ID da empresa:', testData.companyId);
  console.log('- ID da vaga:', testData.jobId);
  console.log('- ID da candidatura:', testData.applicationId);
}

// Executar testes
runTests(); 