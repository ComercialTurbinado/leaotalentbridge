import { ICandidateMetrics } from '@/lib/models/CandidateMetrics';
import CandidateMetrics from '@/lib/models/CandidateMetrics';
import { IUser } from '@/lib/models/User';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
import CandidateDocument from '@/lib/models/CandidateDocument';
import Interview from '@/lib/models/Interview';

export interface MetricsSummary {
  overallScore: number;
  ranking: {
    percentile: number;
    category: string;
  };
  applications: {
    total: number;
    successRate: number;
    pending: number;
    shortlisted: number;
    rejected: number;
  };
  profile: {
    completionRate: number;
    views: number;
    lastUpdate: Date;
  };
  documents: {
    total: number;
    verified: number;
    completionRate: number;
  };
  interviews: {
    total: number;
    successRate: number;
    upcoming: number;
  };
  trends: {
    applicationsGrowth: number;
    profileViewsGrowth: number;
    interviewSuccessGrowth: number;
  };
}

export class CandidateMetricsService {
  /**
   * Calcula métricas completas para um candidato
   */
  static async calculateMetrics(userId: string, period: 'weekly' | 'monthly' = 'monthly'): Promise<MetricsSummary> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Calcular período
      const now = new Date();
      const startDate = this.getPeriodStartDate(now, period);

      // Buscar dados
      const [
        applications,
        documents,
        interviews,
        profileViews,
        previousMetrics
      ] = await Promise.all([
        this.getApplicationMetrics(userId, startDate),
        this.getDocumentMetrics(userId),
        this.getInterviewMetrics(userId, startDate),
        this.getProfileViewMetrics(userId, startDate),
        this.getPreviousMetrics(userId, period, startDate)
      ]);

      // Calcular scores
      const overallScore = this.calculateOverallScore(applications, documents, interviews, profileViews);
      const ranking = await this.calculateRanking(userId, overallScore);
      const trends = this.calculateTrends(applications, interviews, profileViews, previousMetrics);

      // Salvar métricas
      await this.saveMetrics(userId, period, now, {
        applications,
        documents,
        interviews,
        profileViews,
        overallScore,
        ranking,
        trends
      });

      return {
        overallScore,
        ranking,
        applications: {
          total: applications.total,
          successRate: applications.successRate,
          pending: applications.pending,
          shortlisted: applications.shortlisted,
          rejected: applications.rejected
        },
        profile: {
          completionRate: this.calculateProfileCompletion(user),
          views: profileViews.total,
          lastUpdate: user.updatedAt || user.createdAt
        },
        documents: {
          total: documents.total,
          verified: documents.verified,
          completionRate: documents.completionRate
        },
        interviews: {
          total: interviews.total,
          successRate: interviews.successRate,
          upcoming: interviews.upcoming
        },
        trends
      };

    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      throw error;
    }
  }

  /**
   * Busca métricas salvas
   */
  static async getMetrics(userId: string, period: 'weekly' | 'monthly' = 'monthly'): Promise<ICandidateMetrics | null> {
    const now = new Date();
    const startDate = this.getPeriodStartDate(now, period);

    return await CandidateMetrics.findOne({
      userId,
      period,
      date: { $gte: startDate, $lt: now }
    }).sort({ date: -1 });
  }

  /**
   * Busca histórico de métricas
   */
  static async getMetricsHistory(
    userId: string, 
    period: 'weekly' | 'monthly' = 'monthly',
    limit: number = 12
  ): Promise<ICandidateMetrics[]> {
    return await CandidateMetrics.find({
      userId,
      period
    })
    .sort({ date: -1 })
    .limit(limit);
  }

  /**
   * Calcula métricas de candidaturas
   */
  private static async getApplicationMetrics(userId: string, startDate: Date) {
    const applications = await Application.find({
      candidateId: userId,
      createdAt: { $gte: startDate }
    });

    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const accepted = applications.filter(app => app.status === 'accepted').length;

    const successRate = total > 0 ? ((shortlisted + accepted) / total) * 100 : 0;

    return {
      total,
      pending,
      reviewed: total - pending,
      shortlisted,
      rejected,
      accepted,
      successRate: Math.round(successRate)
    };
  }

  /**
   * Calcula métricas de documentos
   */
  private static async getDocumentMetrics(userId: string) {
    const documents = await CandidateDocument.find({ candidateId: userId });

    const total = documents.length;
    const verified = documents.filter(doc => doc.status === 'verified').length;
    const pending = documents.filter(doc => doc.status === 'pending').length;
    const rejected = documents.filter(doc => doc.status === 'rejected').length;

    const completionRate = total > 0 ? (verified / total) * 100 : 0;

    return {
      total,
      verified,
      pending,
      rejected,
      completionRate: Math.round(completionRate)
    };
  }

  /**
   * Calcula métricas de entrevistas
   */
  private static async getInterviewMetrics(userId: string, startDate: Date) {
    const interviews = await Interview.find({
      candidateId: userId,
      scheduledAt: { $gte: startDate }
    });

    const total = interviews.length;
    const scheduled = interviews.filter(int => int.status === 'scheduled').length;
    const completed = interviews.filter(int => int.status === 'completed').length;
    const cancelled = interviews.filter(int => int.status === 'cancelled').length;

    const successRate = completed > 0 ? (completed / (completed + cancelled)) * 100 : 0;
    const upcoming = interviews.filter(int => 
      int.status === 'scheduled' && int.scheduledAt > new Date()
    ).length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      successRate: Math.round(successRate),
      upcoming
    };
  }

  /**
   * Calcula métricas de visualizações do perfil
   */
  private static async getProfileViewMetrics(userId: string, startDate: Date) {
    // Simular visualizações (implementar quando tiver sistema de tracking)
    const total = Math.floor(Math.random() * 50) + 10;
    const byCompanies = Math.floor(total * 0.6);
    const byRecruiters = Math.floor(total * 0.4);

    return {
      total,
      byCompanies,
      byRecruiters
    };
  }

  /**
   * Calcula score geral
   */
  private static calculateOverallScore(applications: any, documents: any, interviews: any, profileViews: any): number {
    const applicationScore = Math.min(applications.successRate * 0.4, 40);
    const documentScore = Math.min(documents.completionRate * 0.3, 30);
    const interviewScore = Math.min(interviews.successRate * 0.2, 20);
    const profileScore = Math.min((profileViews.total / 10) * 0.1, 10);

    return Math.round(applicationScore + documentScore + interviewScore + profileScore);
  }

  /**
   * Calcula ranking do candidato
   */
  private static async calculateRanking(userId: string, score: number): Promise<{ percentile: number; category: string }> {
    // Buscar todos os candidatos para calcular percentil
    const allMetrics = await CandidateMetrics.find({
      period: 'monthly',
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    if (allMetrics.length === 0) {
      return { percentile: 50, category: 'average' };
    }

    const scores = allMetrics.map(m => m.overallScore).sort((a, b) => b - a);
    const percentile = Math.round((scores.filter(s => s < score).length / scores.length) * 100);

    let category = 'average';
    if (percentile >= 90) category = 'top';
    else if (percentile >= 70) category = 'above_average';
    else if (percentile < 30) category = 'below_average';

    return { percentile, category };
  }

  /**
   * Calcula tendências
   */
  private static calculateTrends(current: any, interviews: any, profileViews: any, previous: any) {
    if (!previous) {
      return {
        applicationsGrowth: 0,
        profileViewsGrowth: 0,
        interviewSuccessGrowth: 0
      };
    }

    const applicationsGrowth = previous.applications?.total > 0 
      ? ((current.total - previous.applications.total) / previous.applications.total) * 100 
      : 0;

    const profileViewsGrowth = previous.profileViews?.total > 0
      ? ((profileViews.total - previous.profileViews.total) / previous.profileViews.total) * 100
      : 0;

    const interviewSuccessGrowth = previous.interviews?.successRate > 0
      ? interviews.successRate - previous.interviews.successRate
      : 0;

    return {
      applicationsGrowth: Math.round(applicationsGrowth),
      profileViewsGrowth: Math.round(profileViewsGrowth),
      interviewSuccessGrowth: Math.round(interviewSuccessGrowth)
    };
  }

  /**
   * Calcula completude do perfil
   */
  private static calculateProfileCompletion(user: IUser): number {
    const fields = [
      'name', 'email', 'phone', 'location', 'bio', 'skills', 
      'experience', 'education', 'expectedSalary'
    ];

    const completedFields = fields.filter(field => {
      const value = user[field as keyof IUser];
      return value && (typeof value !== 'string' || value.trim().length > 0);
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }

  /**
   * Busca métricas do período anterior
   */
  private static async getPreviousMetrics(userId: string, period: string, startDate: Date) {
    const previousStartDate = this.getPeriodStartDate(startDate, period);
    const previousEndDate = startDate;

    return await CandidateMetrics.findOne({
      userId,
      period,
      date: { $gte: previousStartDate, $lt: previousEndDate }
    });
  }

  /**
   * Calcula data de início do período
   */
  private static getPeriodStartDate(date: Date, period: string): Date {
    const start = new Date(date);
    
    if (period === 'weekly') {
      start.setDate(start.getDate() - 7);
    } else {
      start.setMonth(start.getMonth() - 1);
    }
    
    return start;
  }

  /**
   * Salva métricas no banco
   */
  private static async saveMetrics(
    userId: string, 
    period: string, 
    date: Date, 
    data: any
  ): Promise<void> {
    await CandidateMetrics.findOneAndUpdate(
      {
        userId,
        period,
        date: { $gte: this.getPeriodStartDate(date, period), $lt: date }
      },
      {
        userId,
        period,
        date,
        ...data,
        updatedAt: new Date()
      },
      { upsert: true }
    );
  }
}
