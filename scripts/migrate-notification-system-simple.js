const mongoose = require('mongoose');

async function migrateNotificationSystem() {
  try {
    console.log('🚀 Iniciando migração do sistema de notificações...');
    
    // Forçar uso do MongoDB Atlas online
    const MONGODB_URI = 'mongodb+srv://comercialturbinado:Pikopiko2212@cluster0.vryeq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Conectando ao MongoDB Atlas...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!\n');

    // 1. Criar preferências de notificação para usuários existentes
    console.log('📝 Criando preferências de notificação...');
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    for (const user of users) {
      const existingPrefs = await mongoose.connection.db.collection('notificationpreferences').findOne({ userId: user._id });
      
      if (!existingPrefs) {
        await mongoose.connection.db.collection('notificationpreferences').insertOne({
          userId: user._id,
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          preferences: {
            // Candidato
            newJobRecommendations: true,
            applicationStatusUpdates: true,
            interviewInvitations: true,
            interviewReminders: true,
            feedbackAvailable: true,
            documentRequests: true,
            simulationInvitations: true,
            
            // Empresa
            newApplications: true,
            applicationUpdates: true,
            interviewResponses: true,
            candidateFeedback: true,
            jobExpiryReminders: true,
            systemUpdates: true,
            
            // Admin
            newInterviews: true,
            feedbackPending: true,
            systemAlerts: true,
            userReports: true,
            maintenanceAlerts: true
          },
          frequency: {
            email: 'immediate',
            push: 'immediate',
            sms: 'never'
          },
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'America/Sao_Paulo'
          },
          allowedDays: [0, 1, 2, 3, 4, 5, 6],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // 2. Criar métricas iniciais para candidatos
    console.log('📊 Criando métricas iniciais para candidatos...');
    const candidates = await mongoose.connection.db.collection('users').find({ type: 'candidato' }).toArray();
    
    for (const candidate of candidates) {
      const existingMetrics = await mongoose.connection.db.collection('candidatemetrics').findOne({ 
        userId: candidate._id,
        period: 'monthly',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      });
      
      if (!existingMetrics) {
        await mongoose.connection.db.collection('candidatemetrics').insertOne({
          userId: candidate._id,
          period: 'monthly',
          date: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          applications: {
            total: 0,
            pending: 0,
            reviewed: 0,
            shortlisted: 0,
            rejected: 0,
            accepted: 0
          },
          profileViews: {
            total: 0,
            byCompanies: 0,
            byRecruiters: 0
          },
          documents: {
            total: 0,
            verified: 0,
            pending: 0,
            rejected: 0,
            completionRate: 0
          },
          interviews: {
            total: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            successRate: 0
          },
          engagement: {
            loginCount: 0,
            profileUpdates: 0,
            documentUploads: 0,
            jobSearches: 0
          },
          overallScore: 0,
          ranking: {
            percentile: 50,
            category: 'average'
          },
          trends: {
            applicationsGrowth: 0,
            profileViewsGrowth: 0,
            interviewSuccessGrowth: 0
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // 3. Atualizar entrevistas existentes com novos campos
    console.log('🎯 Atualizando entrevistas existentes...');
    const interviews = await mongoose.connection.db.collection('interviews').find({}).toArray();
    
    for (const interview of interviews) {
      const updates = {};
      
      // Adicionar campos de moderação se não existirem
      if (!interview.adminStatus) {
        updates.adminStatus = 'approved'; // Entrevistas existentes são aprovadas por padrão
        updates.adminApprovedAt = interview.createdAt || new Date();
      }
      
      if (!interview.candidateResponse) {
        updates.candidateResponse = 'pending';
      }
      
      if (!interview.feedbackStatus) {
        updates.feedbackStatus = 'pending';
      }
      
      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db.collection('interviews').updateOne(
          { _id: interview._id },
          { $set: updates }
        );
      }
    }

    // 4. Criar notificação de boas-vindas para usuários
    console.log('🔔 Criando notificações de boas-vindas...');
    for (const user of users) {
      const existingWelcome = await mongoose.connection.db.collection('notifications').findOne({
        userId: user._id,
        type: 'general',
        title: 'Bem-vindo ao Leão Talente Bridge!'
      });
      
      if (!existingWelcome) {
        await mongoose.connection.db.collection('notifications').insertOne({
          userId: user._id,
          type: 'general',
          title: 'Bem-vindo ao Leão Talente Bridge!',
          message: 'Sistema de notificações ativado. Você receberá atualizações sobre suas candidaturas, entrevistas e oportunidades.',
          priority: 'medium',
          read: false,
          delivery: {
            email: { sent: false },
            push: { sent: false },
            sms: { sent: false }
          },
          createdAt: new Date()
        });
      }
    }

    // 5. Adicionar campo pushSubscriptions aos usuários se não existir
    console.log('📱 Verificando campo pushSubscriptions...');
    const usersWithoutPushSubs = await mongoose.connection.db.collection('users').find({
      pushSubscriptions: { $exists: false }
    }).toArray();
    
    if (usersWithoutPushSubs.length > 0) {
      await mongoose.connection.db.collection('users').updateMany(
        { pushSubscriptions: { $exists: false } },
        { $set: { pushSubscriptions: [] } }
      );
      console.log(`  ✅ Campo pushSubscriptions adicionado para ${usersWithoutPushSubs.length} usuários`);
    } else {
      console.log('  ✅ Campo pushSubscriptions já existe para todos os usuários');
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log(`📊 Usuários processados: ${users.length}`);
    console.log(`👥 Candidatos com métricas: ${candidates.length}`);
    console.log(`🎯 Entrevistas atualizadas: ${interviews.length}`);

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Executar migração
if (require.main === module) {
  migrateNotificationSystem()
    .then(() => {
      console.log('🎉 Migração finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na migração:', error);
      process.exit(1);
    });
}

module.exports = { migrateNotificationSystem };

