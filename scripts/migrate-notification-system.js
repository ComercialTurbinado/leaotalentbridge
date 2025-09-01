const mongoose = require('mongoose');
require('dotenv').config();

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

    // Importar modelos usando import dinâmico
    const User = (await import('../src/lib/models/User')).default;
    const NotificationPreferences = (await import('../src/lib/models/NotificationPreferences')).default;
    const CandidateMetrics = (await import('../src/lib/models/CandidateMetrics')).default;
    const Notification = (await import('../src/lib/models/Notification')).default;
    const Interview = (await import('../src/lib/models/Interview')).default;

    // 1. Criar preferências de notificação para usuários existentes
    console.log('📝 Criando preferências de notificação...');
    const users = await User.find({});
    
    for (const user of users) {
      const existingPrefs = await NotificationPreferences.findOne({ userId: user._id });
      
      if (!existingPrefs) {
        await NotificationPreferences.create({
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
          allowedDays: [0, 1, 2, 3, 4, 5, 6]
        });
      }
    }

    // 2. Criar métricas iniciais para candidatos
    console.log('📊 Criando métricas iniciais para candidatos...');
    const candidates = await User.find({ type: 'candidato' });
    
    for (const candidate of candidates) {
      const existingMetrics = await CandidateMetrics.findOne({ 
        userId: candidate._id,
        period: 'monthly',
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      });
      
      if (!existingMetrics) {
        await CandidateMetrics.create({
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
          }
        });
      }
    }

    // 3. Atualizar entrevistas existentes com novos campos
    console.log('🎯 Atualizando entrevistas existentes...');
    const interviews = await Interview.find({});
    
    for (const interview of interviews) {
      const updates = {};
      
      // Adicionar campos de moderação se não existirem
      if (!interview.adminStatus) {
        updates.adminStatus = 'approved'; // Entrevistas existentes são aprovadas por padrão
        updates.adminApprovedAt = interview.createdAt;
      }
      
      if (!interview.candidateResponse) {
        updates.candidateResponse = 'pending';
      }
      
      if (!interview.feedbackStatus) {
        updates.feedbackStatus = 'pending';
      }
      
      if (Object.keys(updates).length > 0) {
        await Interview.findByIdAndUpdate(interview._id, updates);
      }
    }

    // 4. Criar notificação de boas-vindas para usuários
    console.log('🔔 Criando notificações de boas-vindas...');
    for (const user of users) {
      const existingWelcome = await Notification.findOne({
        userId: user._id,
        type: 'general',
        title: 'Bem-vindo ao Leão Talente Bridge!'
      });
      
      if (!existingWelcome) {
        await Notification.create({
          userId: user._id,
          type: 'general',
          title: 'Bem-vindo ao Leão Talente Bridge!',
          message: 'Sistema de notificações ativado. Você receberá atualizações sobre suas candidaturas, entrevistas e oportunidades.',
          priority: 'medium',
          delivery: {
            email: { sent: false },
            push: { sent: false },
            sms: { sent: false }
          }
        });
      }
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
