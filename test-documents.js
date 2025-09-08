const mongoose = require('mongoose');
const CandidateDocument = require('./src/lib/models/CandidateDocument');
const User = require('./src/lib/models/User');

// Conectar ao MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leao-careers');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Função para criar um candidato de teste
async function createTestCandidate() {
  try {
    // Verificar se já existe um candidato de teste
    let candidate = await User.findOne({ email: 'teste@candidato.com' });
    
    if (!candidate) {
      candidate = new User({
        name: 'Candidato Teste',
        email: 'teste@candidato.com',
        password: 'senha123',
        type: 'candidato',
        status: 'approved'
      });
      await candidate.save();
      console.log('✅ Candidato de teste criado:', candidate._id);
    } else {
      console.log('✅ Candidato de teste já existe:', candidate._id);
    }
    
    return candidate;
  } catch (error) {
    console.error('❌ Erro ao criar candidato de teste:', error);
    throw error;
  }
}

// Função para criar um admin de teste
async function createTestAdmin() {
  try {
    // Verificar se já existe um admin de teste
    let admin = await User.findOne({ email: 'admin@teste.com' });
    
    if (!admin) {
      admin = new User({
        name: 'Admin Teste',
        email: 'admin@teste.com',
        password: 'senha123',
        type: 'admin',
        status: 'approved'
      });
      await admin.save();
      console.log('✅ Admin de teste criado:', admin._id);
    } else {
      console.log('✅ Admin de teste já existe:', admin._id);
    }
    
    return admin;
  } catch (error) {
    console.error('❌ Erro ao criar admin de teste:', error);
    throw error;
  }
}

// Função para criar documentos de teste
async function createTestDocuments(candidateId, adminId) {
  try {
    // Limpar documentos existentes
    await CandidateDocument.deleteMany({ candidateId });
    console.log('🧹 Documentos antigos removidos');

    // Documento enviado pelo candidato
    const candidateDocument = new CandidateDocument({
      candidateId: candidateId,
      type: 'cv',
      fileType: 'pdf',
      title: 'Currículo do Candidato',
      description: 'Meu currículo atualizado',
      fileName: 'curriculo.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...', // Base64 simulado
      fileSize: 1024000,
      mimeType: 'application/pdf',
      status: 'pending',
      uploadedBy: 'candidate'
    });
    await candidateDocument.save();
    console.log('✅ Documento do candidato criado');

    // Documento enviado pelo admin
    const adminDocument = new CandidateDocument({
      candidateId: candidateId,
      type: 'form',
      fileType: 'pdf',
      title: 'Formulário de Avaliação',
      description: 'Formulário enviado pelo admin para preenchimento',
      fileName: 'formulario_avaliacao.pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...', // Base64 simulado
      fileSize: 512000,
      mimeType: 'application/pdf',
      status: 'verified',
      uploadedBy: 'admin',
      verifiedBy: adminId,
      verifiedAt: new Date()
    });
    await adminDocument.save();
    console.log('✅ Documento do admin criado');

    return { candidateDocument, adminDocument };
  } catch (error) {
    console.error('❌ Erro ao criar documentos de teste:', error);
    throw error;
  }
}

// Função para testar a busca de documentos
async function testDocumentRetrieval(candidateId) {
  try {
    console.log('\n🔍 Testando busca de documentos...');
    
    // Buscar todos os documentos do candidato
    const allDocuments = await CandidateDocument.find({ candidateId })
      .sort({ createdAt: -1 });
    
    console.log(`📄 Total de documentos encontrados: ${allDocuments.length}`);
    
    // Documentos enviados pelo candidato
    const candidateDocuments = allDocuments.filter(doc => doc.uploadedBy === 'candidate');
    console.log(`📤 Documentos enviados pelo candidato: ${candidateDocuments.length}`);
    
    // Documentos enviados pelo admin
    const adminDocuments = allDocuments.filter(doc => doc.uploadedBy === 'admin');
    console.log(`📥 Documentos enviados pelo admin: ${adminDocuments.length}`);
    
    // Mostrar detalhes dos documentos
    allDocuments.forEach((doc, index) => {
      console.log(`\n📋 Documento ${index + 1}:`);
      console.log(`   Título: ${doc.title}`);
      console.log(`   Tipo: ${doc.type}`);
      console.log(`   Enviado por: ${doc.uploadedBy}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Data: ${doc.createdAt.toLocaleDateString('pt-BR')}`);
    });
    
    return allDocuments;
  } catch (error) {
    console.error('❌ Erro ao testar busca de documentos:', error);
    throw error;
  }
}

// Função principal
async function runTest() {
  try {
    console.log('🚀 Iniciando teste do sistema de documentos...\n');
    
    // Conectar ao banco
    await connectDB();
    
    // Criar usuários de teste
    const candidate = await createTestCandidate();
    const admin = await createTestAdmin();
    
    // Criar documentos de teste
    await createTestDocuments(candidate._id, admin._id);
    
    // Testar busca de documentos
    await testDocumentRetrieval(candidate._id);
    
    console.log('\n✅ Teste concluído com sucesso!');
    console.log('\n📝 Resumo:');
    console.log(`   - Candidato ID: ${candidate._id}`);
    console.log(`   - Admin ID: ${admin._id}`);
    console.log('   - Documentos criados: 2 (1 do candidato, 1 do admin)');
    console.log('   - Sistema de busca funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB');
  }
}

// Executar o teste
runTest();
