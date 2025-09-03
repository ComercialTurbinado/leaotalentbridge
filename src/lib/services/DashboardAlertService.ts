import { IUser } from '@/lib/models/User';
import { ICandidateDocument } from '@/lib/models/CandidateDocument';
import { IInterview } from '@/lib/models/Interview';
import { IApplication } from '@/lib/models/Application';
import CandidateDocument from '@/lib/models/CandidateDocument';
import Interview from '@/lib/models/Interview';
import Application from '@/lib/models/Application';
import User from '@/lib/models/User';

export interface DashboardAlert {
  id: string;
  type: 'document' | 'interview' | 'simulation' | 'application' | 'profile' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action?: {
    label: string;
    url: string;
  };
  data?: any;
  createdAt: Date;
}

export interface DashboardSummary {
  alerts: DashboardAlert[];
  quickStats: {
    pendingDocuments: number;
    upcomingInterviews: number;
    pendingApplications: number;
    completedSimulations: number;
    profileCompletion: number;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    date: Date;
    status: string;
  }>;
}

export class DashboardAlertService {
  /**
   * Gera resumo completo do dashboard para um candidato
   */
  static async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    try {
      const [alerts, quickStats, recentActivity] = await Promise.all([
        this.generateAlerts(userId),
        this.calculateQuickStats(userId),
        this.getRecentActivity(userId)
      ]);

      return {
        alerts,
        quickStats,
        recentActivity
      };
    } catch (error) {
      console.error('Erro ao gerar resumo do dashboard:', error);
      return {
        alerts: [],
        quickStats: {
          pendingDocuments: 0,
          upcomingInterviews: 0,
          pendingApplications: 0,
          completedSimulations: 0,
          profileCompletion: 0
        },
        recentActivity: []
      };
    }
  }

  /**
   * Gera alertas para o candidato
   */
  private static async generateAlerts(userId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];

    // Alertas de documentos
    const documentAlerts = await this.getDocumentAlerts(userId);
    alerts.push(...documentAlerts);

    // Alertas de entrevistas
    const interviewAlerts = await this.getInterviewAlerts(userId);
    alerts.push(...interviewAlerts);

    // Alertas de simulações
    const simulationAlerts = await this.getSimulationAlerts(userId);
    alerts.push(...simulationAlerts);

    // Alertas de perfil
    const profileAlerts = await this.getProfileAlerts(userId);
    alerts.push(...profileAlerts);

    // Alertas de candidaturas
    const applicationAlerts = await this.getApplicationAlerts(userId);
    alerts.push(...applicationAlerts);

    // Ordenar por prioridade e data
    return alerts.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Alertas relacionados a documentos
   */
  private static async getDocumentAlerts(userId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];
    
    const documents = await CandidateDocument.find({ candidateId: userId });
    
    // Documentos rejeitados
    const rejectedDocs = documents.filter(doc => doc.status === 'rejected');
    if (rejectedDocs.length > 0) {
      alerts.push({
        id: 'rejected-documents',
        type: 'document',
        priority: 'high',
        title: 'Documentos Rejeitados',
        message: `Você tem ${rejectedDocs.length} documento(s) rejeitado(s) que precisam ser corrigidos.`,
        action: {
          label: 'Ver Documentos',
          url: '/candidato/documentos'
        },
        data: { rejectedCount: rejectedDocs.length },
        createdAt: new Date()
      });
    }

    // Documentos pendentes há muito tempo
    const pendingDocs = documents.filter(doc => 
      doc.status === 'pending' && 
      new Date(doc.createdAt).getTime() < Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 dias
    );
    if (pendingDocs.length > 0) {
      alerts.push({
        id: 'pending-documents-long',
        type: 'document',
        priority: 'medium',
        title: 'Documentos Pendentes',
        message: `Você tem ${pendingDocs.length} documento(s) pendente(s) há mais de 7 dias.`,
        action: {
          label: 'Ver Documentos',
          url: '/candidato/documentos'
        },
        data: { pendingCount: pendingDocs.length },
        createdAt: new Date()
      });
    }

    // Documentos obrigatórios faltando
    const requiredTypes = ['cv', 'passport', 'diploma'];
    const existingTypes = documents.map(doc => doc.type);
    const missingTypes = requiredTypes.filter(type => !existingTypes.includes(type));
    
    if (missingTypes.length > 0) {
      alerts.push({
        id: 'missing-required-documents',
        type: 'document',
        priority: 'urgent',
        title: 'Documentos Obrigatórios Faltando',
        message: `Você precisa enviar: ${missingTypes.join(', ')}.`,
        action: {
          label: 'Enviar Documentos',
          url: '/candidato/documentos'
        },
        data: { missingTypes },
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * Alertas relacionados a entrevistas
   */
  private static async getInterviewAlerts(userId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];
    
    const interviews = await Interview.find({ candidateId: userId });
    
    // Entrevistas próximas (próximas 24 horas)
    const upcomingInterviews = interviews.filter(interview => {
      const interviewTime = new Date(interview.scheduledAt);
      const now = new Date();
      const timeDiff = interviewTime.getTime() - now.getTime();
      return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 horas
    });

    if (upcomingInterviews.length > 0) {
      alerts.push({
        id: 'upcoming-interviews',
        type: 'interview',
        priority: 'urgent',
        title: 'Entrevistas Próximas',
        message: `Você tem ${upcomingInterviews.length} entrevista(s) nas próximas 24 horas.`,
        action: {
          label: 'Ver Entrevistas',
          url: '/candidato/entrevistas'
        },
        data: { upcomingCount: upcomingInterviews.length },
        createdAt: new Date()
      });
    }

    // Entrevistas agendadas (próximos 7 dias)
    const scheduledInterviews = interviews.filter(interview => {
      const interviewTime = new Date(interview.scheduledAt);
      const now = new Date();
      const timeDiff = interviewTime.getTime() - now.getTime();
      return timeDiff > 0 && timeDiff <= 7 * 24 * 60 * 60 * 1000; // 7 dias
    });

    if (scheduledInterviews.length > 0) {
      alerts.push({
        id: 'scheduled-interviews',
        type: 'interview',
        priority: 'medium',
        title: 'Entrevistas Agendadas',
        message: `Você tem ${scheduledInterviews.length} entrevista(s) agendada(s) para esta semana.`,
        action: {
          label: 'Ver Entrevistas',
          url: '/candidato/entrevistas'
        },
        data: { scheduledCount: scheduledInterviews.length },
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * Alertas relacionados a simulações
   */
  private static async getSimulationAlerts(userId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];
    
    // Simular dados de simulações (implementar quando tiver o modelo)
    const completedSimulations = 0; // await Simulation.countDocuments({ userId, status: 'completed' });
    const availableSimulations = 5; // Simular simulações disponíveis
    
    if (completedSimulations === 0) {
      alerts.push({
        id: 'no-simulations',
        type: 'simulation',
        priority: 'medium',
        title: 'Simulações Disponíveis',
        message: `Você tem ${availableSimulations} simulações disponíveis para praticar.`,
        action: {
          label: 'Fazer Simulações',
          url: '/candidato/simulacoes'
        },
        data: { availableCount: availableSimulations },
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * Alertas relacionados ao perfil
   */
  private static async getProfileAlerts(userId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];
    
    const user = await User.findById(userId);
    if (!user) return alerts;

    const profileCompletion = this.calculateProfileCompletion(user);
    
    if (profileCompletion < 70) {
      alerts.push({
        id: 'incomplete-profile',
        type: 'profile',
        priority: 'high',
        title: 'Perfil Incompleto',
        message: `Seu perfil está ${profileCompletion}% completo. Complete para receber mais recomendações.`,
        action: {
          label: 'Completar Perfil',
          url: '/candidato/perfil'
        },
        data: { completion: profileCompletion },
        createdAt: new Date()
      });
    }

    // Perfil não atualizado há muito tempo
    const lastUpdate = user.updatedAt || user.createdAt;
    const daysSinceUpdate = (Date.now() - new Date(lastUpdate).getTime()) / (24 * 60 * 60 * 1000);
    
    if (daysSinceUpdate > 30) {
      alerts.push({
        id: 'stale-profile',
        type: 'profile',
        priority: 'low',
        title: 'Perfil Desatualizado',
        message: 'Seu perfil não é atualizado há mais de 30 dias. Considere atualizá-lo.',
        action: {
          label: 'Atualizar Perfil',
          url: '/candidato/perfil'
        },
        data: { daysSinceUpdate: Math.floor(daysSinceUpdate) },
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * Alertas relacionados a candidaturas
   */
  private static async getApplicationAlerts(userId: string): Promise<DashboardAlert[]> {
    const alerts: DashboardAlert[] = [];
    
    const applications = await Application.find({ candidateId: userId });
    
    // Candidaturas sem resposta há muito tempo
    const staleApplications = applications.filter(app => 
      app.status === 'pending' && 
      new Date(app.createdAt).getTime() < Date.now() - (14 * 24 * 60 * 60 * 1000) // 14 dias
    );

    if (staleApplications.length > 0) {
      alerts.push({
        id: 'stale-applications',
        type: 'application',
        priority: 'low',
        title: 'Candidaturas Sem Resposta',
        message: `Você tem ${staleApplications.length} candidatura(s) sem resposta há mais de 14 dias.`,
        action: {
          label: 'Ver Candidaturas',
          url: '/candidato/candidaturas'
        },
        data: { staleCount: staleApplications.length },
        createdAt: new Date()
      });
    }

    return alerts;
  }

  /**
   * Calcula estatísticas rápidas
   */
  private static async calculateQuickStats(userId: string) {
    try {
      const [documents, interviews, applications, user] = await Promise.all([
        CandidateDocument.find({ candidateId: userId }).lean(),
        Interview.find({ candidateId: userId }).lean(),
        Application.find({ candidateId: userId }).lean(),
        User.findById(userId).lean()
      ]);

      // Documentos
      const totalDocuments = documents.length;
      const pendingDocuments = documents.filter(doc => doc.status === 'pending').length;
      const verifiedDocuments = documents.filter(doc => doc.status === 'verified').length;
      const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length;

      // Entrevistas
      const now = new Date();
      const upcomingInterviews = interviews.filter(interview => 
        new Date(interview.scheduledAt) > now && 
        interview.status === 'scheduled'
      ).length;

      const totalInterviews = interviews.length;
      const completedInterviews = interviews.filter(interview => 
        interview.status === 'completed'
      ).length;

      // Candidaturas
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      const shortlistedApplications = applications.filter(app => app.status === 'shortlisted').length;
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
      const acceptedApplications = applications.filter(app => app.status === 'accepted').length;

      // Simulações (implementar quando tiver o modelo)
      const completedSimulations = 0; // await Simulation.countDocuments({ userId, status: 'completed' });
      const availableSimulations = 5; // Simular simulações disponíveis

      // Perfil
      const profileCompletion = user ? this.calculateProfileCompletion(user) : 0;

      return {
        pendingDocuments,
        upcomingInterviews,
        pendingApplications,
        completedSimulations,
        profileCompletion,
        totalApplications,
        totalDocuments,
        verifiedDocuments,
        rejectedDocuments,
        totalInterviews,
        completedInterviews,
        shortlistedApplications,
        rejectedApplications,
        acceptedApplications,
        availableSimulations
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas rápidas:', error);
      return {
        pendingDocuments: 0,
        upcomingInterviews: 0,
        pendingApplications: 0,
        completedSimulations: 0,
        profileCompletion: 0,
        totalApplications: 0,
        totalDocuments: 0,
        verifiedDocuments: 0,
        rejectedDocuments: 0,
        totalInterviews: 0,
        completedInterviews: 0,
        shortlistedApplications: 0,
        rejectedApplications: 0,
        acceptedApplications: 0,
        availableSimulations: 0
      };
    }
  }

  /**
   * Busca atividade recente
   */
  private static async getRecentActivity(userId: string) {
    try {
      const [recentDocuments, recentInterviews, recentApplications] = await Promise.all([
        CandidateDocument.find({ candidateId: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Interview.find({ candidateId: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Application.find({ candidateId: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);

      const activities: Array<{
        type: string;
        title: string;
        description: string;
        date: Date;
        status: string;
        message: string;
        timestamp: string;
      }> = [];

      // Atividades de documentos
      recentDocuments.forEach(doc => {
        const statusText = doc.status === 'verified' ? 'aprovado' : 
                          doc.status === 'rejected' ? 'rejeitado' : 'enviado para análise';
        
        activities.push({
          type: 'document_uploaded',
          title: `Documento ${doc.type} ${doc.status === 'verified' ? 'aprovado' : doc.status === 'rejected' ? 'rejeitado' : 'enviado'}`,
          description: `Documento de ${doc.type} foi ${statusText}`,
          date: doc.createdAt,
          status: doc.status,
          message: `Documento ${doc.type} ${statusText}`,
          timestamp: doc.createdAt.toISOString()
        });
      });

      // Atividades de entrevistas
      recentInterviews.forEach(interview => {
        const statusText = interview.status === 'scheduled' ? 'agendada' : 
                          interview.status === 'completed' ? 'realizada' : 
                          interview.status === 'cancelled' ? 'cancelada' : 'pendente';
        
        activities.push({
          type: 'interview_scheduled',
          title: `Entrevista ${statusText}`,
          description: `Entrevista foi ${statusText}${interview.scheduledAt ? ` para ${new Date(interview.scheduledAt).toLocaleDateString('pt-BR')}` : ''}`,
          date: interview.createdAt,
          status: interview.status,
          message: `Entrevista ${statusText}`,
          timestamp: interview.createdAt.toISOString()
        });
      });

      // Atividades de candidaturas
      recentApplications.forEach(app => {
        const statusText = app.status === 'pending' ? 'enviada' : 
                          app.status === 'shortlisted' ? 'pré-selecionada' : 
                          app.status === 'rejected' ? 'rejeitada' : 
                          app.status === 'accepted' ? 'aceita' : 'em análise';
        
        activities.push({
          type: 'application_submitted',
          title: `Candidatura ${statusText}`,
          description: `Candidatura para vaga foi ${statusText}`,
          date: app.createdAt,
          status: app.status,
          message: `Candidatura ${statusText}`,
          timestamp: app.createdAt.toISOString()
        });
      });

      // Ordenar por data e retornar os mais recentes
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error);
      return [];
    }
  }

  /**
   * Calcula completude do perfil de forma mais precisa
   */
  private static calculateProfileCompletion(user: IUser): number {
    try {
      const requiredFields = [
        { field: 'name', weight: 15 },
        { field: 'email', weight: 10 },
        { field: 'phone', weight: 10 },
        { field: 'birthDate', weight: 8 },
        { field: 'nationality', weight: 5 },
        { field: 'address.city', weight: 8 },
        { field: 'address.state', weight: 8 },
        { field: 'professionalInfo.summary', weight: 12 },
        { field: 'skills', weight: 10 },
        { field: 'education', weight: 8 },
        { field: 'languages', weight: 6 }
      ];

      let totalScore = 0;
      let maxScore = 0;

      requiredFields.forEach(({ field, weight }) => {
        maxScore += weight;
        
        if (field.includes('.')) {
          // Campo aninhado (ex: address.city)
          const [parent, child] = field.split('.');
          const parentValue = user[parent as keyof IUser];
          
          if (parentValue && typeof parentValue === 'object' && parentValue[child as keyof typeof parentValue]) {
            totalScore += weight;
          }
        } else {
          // Campo direto
          const value = user[field as keyof IUser];
          
          if (value) {
            if (Array.isArray(value)) {
              // Array (skills, education, languages)
              if (value.length > 0) {
                totalScore += weight;
              }
            } else if (typeof value === 'string') {
              // String
              if (value.trim().length > 0) {
                totalScore += weight;
              }
            } else {
              // Outros tipos (number, boolean, etc.)
              totalScore += weight;
            }
          }
        }
      });

      return Math.round((totalScore / maxScore) * 100);
    } catch (error) {
      console.error('Erro ao calcular completude do perfil:', error);
      return 0;
    }
  }
}
