import { IInterview } from '@/lib/models/Interview';
import Interview from '@/lib/models/Interview';
import { NotificationService } from './NotificationService';
import Application from '@/lib/models/Application';
import Job from '@/lib/models/Job';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';

export interface CreateInterviewData {
  candidateId: string;
  companyId: string;
  jobId?: string;
  applicationId?: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number;
  type: 'presential' | 'online' | 'phone';
  location?: string;
  meetingUrl?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  interviewerPhone?: string;
  notes?: string;
  createdBy: string;
}

export interface InterviewResponse {
  interview: IInterview;
  candidate: any;
  company: any;
  job?: any;
  application?: any;
}

export class InterviewService {
  /**
   * Cria uma nova entrevista (empresa sugere, aguarda aprovação do admin)
   */
  static async createInterview(data: CreateInterviewData): Promise<InterviewResponse> {
    try {
      // Verificar se já existe entrevista para esta candidatura
      if (data.applicationId) {
        const existingInterview = await Interview.findOne({
          applicationId: data.applicationId,
          status: { $in: ['pending_approval', 'scheduled', 'confirmed'] }
        });

        if (existingInterview) {
          throw new Error('Já existe uma entrevista agendada para esta candidatura');
        }
      }

      const interview = new Interview({
        ...data,
        status: 'pending_approval',
        adminStatus: 'pending',
        candidateResponse: 'pending',
        feedbackStatus: 'pending'
      });

      await interview.save();

      // Buscar dados relacionados
      const [candidate, company, job, application] = await Promise.all([
        User.findById(data.candidateId).select('name email'),
        Company.findById(data.companyId).select('name'),
        data.jobId ? Job.findById(data.jobId).select('title') : null,
        data.applicationId ? Application.findById(data.applicationId) : null
      ]);

      // Notificar admin sobre nova entrevista pendente
      await this.notifyAdminNewInterview(interview, candidate, company, job);

      return {
        interview,
        candidate,
        company,
        job,
        application
      };

    } catch (error) {
      console.error('Erro ao criar entrevista:', error);
      throw error;
    }
  }

  /**
   * Admin aprova ou rejeita entrevista
   */
  static async adminApproveInterview(
    interviewId: string, 
    adminId: string, 
    action: 'approve' | 'reject',
    comments?: string
  ): Promise<InterviewResponse> {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Entrevista não encontrada');
      }

      if (interview.adminStatus !== 'pending') {
        throw new Error('Esta entrevista já foi processada');
      }

      // Atualizar status
      interview.adminStatus = action;
      interview.adminComments = comments;
      interview.adminApprovedBy = adminId as any;
      interview.adminApprovedAt = new Date();

      if (action === 'approve') {
        interview.status = 'scheduled';
      } else {
        interview.status = 'rejected';
      }

      await interview.save();

      // Buscar dados relacionados
      const [candidate, company, job, application] = await Promise.all([
        User.findById(interview.candidateId).select('name email'),
        Company.findById(interview.companyId).select('name'),
        interview.jobId ? Job.findById(interview.jobId).select('title') : null,
        interview.applicationId ? Application.findById(interview.applicationId) : null
      ]);

      // Notificar candidato sobre aprovação/rejeição
      if (action === 'approve') {
        await this.notifyCandidateInterviewApproved(interview, candidate, company, job);
      } else {
        await this.notifyCandidateInterviewRejected(interview, candidate, company, job);
      }

      // Notificar empresa sobre decisão
      await this.notifyCompanyInterviewDecision(interview, candidate, company, job, action);

      return {
        interview,
        candidate,
        company,
        job,
        application
      };

    } catch (error) {
      console.error('Erro ao aprovar/rejeitar entrevista:', error);
      throw error;
    }
  }

  /**
   * Candidato aceita ou rejeita entrevista
   */
  static async candidateRespondToInterview(
    interviewId: string,
    candidateId: string,
    response: 'accepted' | 'rejected',
    comments?: string
  ): Promise<InterviewResponse> {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Entrevista não encontrada');
      }

      if (interview.candidateId.toString() !== candidateId) {
        throw new Error('Você não tem permissão para responder esta entrevista');
      }

      if (interview.candidateResponse !== 'pending') {
        throw new Error('Você já respondeu esta entrevista');
      }

      if (interview.adminStatus !== 'approved') {
        throw new Error('Esta entrevista ainda não foi aprovada pelo administrador');
      }

      // Atualizar resposta do candidato
      interview.candidateResponse = response;
      interview.candidateResponseAt = new Date();
      interview.candidateComments = comments;

      if (response === 'accepted') {
        interview.status = 'confirmed';
      } else {
        interview.status = 'cancelled';
      }

      await interview.save();

      // Buscar dados relacionados
      const [candidate, company, job, application] = await Promise.all([
        User.findById(interview.candidateId).select('name email'),
        Company.findById(interview.companyId).select('name'),
        interview.jobId ? Job.findById(interview.jobId).select('title') : null,
        interview.applicationId ? Application.findById(interview.applicationId) : null
      ]);

      // Notificar empresa sobre resposta do candidato
      await this.notifyCompanyCandidateResponse(interview, candidate, company, job, response);

      // Notificar admin sobre resposta
      await this.notifyAdminCandidateResponse(interview, candidate, company, job, response);

      return {
        interview,
        candidate,
        company,
        job,
        application
      };

    } catch (error) {
      console.error('Erro ao responder entrevista:', error);
      throw error;
    }
  }

  /**
   * Empresa submete feedback da entrevista
   */
  static async submitCompanyFeedback(
    interviewId: string,
    companyUserId: string,
    feedback: {
      technical: number;
      communication: number;
      experience: number;
      overall: number;
      comments?: string;
    }
  ): Promise<InterviewResponse> {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Entrevista não encontrada');
      }

      if (interview.status !== 'completed') {
        throw new Error('A entrevista deve estar marcada como concluída para enviar feedback');
      }

      if (interview.companyFeedback) {
        throw new Error('Feedback já foi enviado para esta entrevista');
      }

      // Salvar feedback
      interview.companyFeedback = {
        ...feedback,
        submittedAt: new Date(),
        submittedBy: companyUserId as any
      };
      interview.feedbackStatus = 'pending';

      await interview.save();

      // Buscar dados relacionados
      const [candidate, company, job, application] = await Promise.all([
        User.findById(interview.candidateId).select('name email'),
        Company.findById(interview.companyId).select('name'),
        interview.jobId ? Job.findById(interview.jobId).select('title') : null,
        interview.applicationId ? Application.findById(interview.applicationId) : null
      ]);

      // Notificar admin sobre feedback pendente
      await this.notifyAdminFeedbackPending(interview, candidate, company, job);

      return {
        interview,
        candidate,
        company,
        job,
        application
      };

    } catch (error) {
      console.error('Erro ao enviar feedback da empresa:', error);
      throw error;
    }
  }

  /**
   * Admin aprova ou rejeita feedback
   */
  static async adminApproveFeedback(
    interviewId: string,
    adminId: string,
    action: 'approve' | 'reject',
    comments?: string
  ): Promise<InterviewResponse> {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Entrevista não encontrada');
      }

      if (!interview.companyFeedback) {
        throw new Error('Não há feedback para aprovar');
      }

      if (interview.feedbackStatus !== 'pending') {
        throw new Error('Este feedback já foi processado');
      }

      // Atualizar status do feedback
      interview.feedbackStatus = action;
      interview.feedbackApprovedBy = adminId as any;
      interview.feedbackApprovedAt = new Date();
      interview.feedbackAdminComments = comments;

      await interview.save();

      // Buscar dados relacionados
      const [candidate, company, job, application] = await Promise.all([
        User.findById(interview.candidateId).select('name email'),
        Company.findById(interview.companyId).select('name'),
        interview.jobId ? Job.findById(interview.jobId).select('title') : null,
        interview.applicationId ? Application.findById(interview.applicationId) : null
      ]);

      // Se aprovado, notificar candidato sobre feedback disponível
      if (action === 'approve') {
        await this.notifyCandidateFeedbackAvailable(interview, candidate, company, job);
      }

      return {
        interview,
        candidate,
        company,
        job,
        application
      };

    } catch (error) {
      console.error('Erro ao aprovar feedback:', error);
      throw error;
    }
  }

  /**
   * Candidato submete feedback da entrevista
   */
  static async submitCandidateFeedback(
    interviewId: string,
    candidateId: string,
    feedback: {
      rating: number;
      comments?: string;
    }
  ): Promise<InterviewResponse> {
    try {
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        throw new Error('Entrevista não encontrada');
      }

      if (interview.candidateId.toString() !== candidateId) {
        throw new Error('Você não tem permissão para enviar feedback para esta entrevista');
      }

      if (interview.candidateFeedback) {
        throw new Error('Feedback já foi enviado para esta entrevista');
      }

      // Salvar feedback do candidato
      interview.candidateFeedback = {
        ...feedback,
        submittedAt: new Date()
      };

      await interview.save();

      // Buscar dados relacionados
      const [candidate, company, job, application] = await Promise.all([
        User.findById(interview.candidateId).select('name email'),
        Company.findById(interview.companyId).select('name'),
        interview.jobId ? Job.findById(interview.jobId).select('title') : null,
        interview.applicationId ? Application.findById(interview.applicationId) : null
      ]);

      return {
        interview,
        candidate,
        company,
        job,
        application
      };

    } catch (error) {
      console.error('Erro ao enviar feedback do candidato:', error);
      throw error;
    }
  }

  /**
   * Busca entrevistas com filtros
   */
  static async getInterviews(filters: {
    candidateId?: string;
    companyId?: string;
    adminStatus?: string;
    status?: string;
    feedbackStatus?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ interviews: IInterview[]; total: number }> {
    try {
      const query: any = {};

      if (filters.candidateId) query.candidateId = filters.candidateId;
      if (filters.companyId) query.companyId = filters.companyId;
      if (filters.adminStatus) query.adminStatus = filters.adminStatus;
      if (filters.status) query.status = filters.status;
      if (filters.feedbackStatus) query.feedbackStatus = filters.feedbackStatus;

      const limit = filters.limit || 20;
      const offset = filters.offset || 0;

      const [interviews, total] = await Promise.all([
        Interview.find(query)
          .populate('candidateId', 'name email')
          .populate('companyId', 'name')
          .populate('jobId', 'title')
          .populate('applicationId')
          .populate('createdBy', 'name')
          .populate('adminApprovedBy', 'name')
          .populate('feedbackApprovedBy', 'name')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset),
        Interview.countDocuments(query)
      ]);

      return { interviews, total };

    } catch (error) {
      console.error('Erro ao buscar entrevistas:', error);
      throw error;
    }
  }

  // Métodos de notificação privados
  private static async notifyAdminNewInterview(interview: IInterview, candidate: any, company: any, job: any) {
    // Buscar todos os admins
    const admins = await User.find({ type: 'admin' });
    
    for (const admin of admins) {
      await NotificationService.createGeneralNotification(
        admin._id.toString(),
        'Nova Entrevista Pendente de Aprovação',
        `A empresa ${company?.name} solicitou uma entrevista com ${candidate?.name} para a vaga ${job?.title || 'sem vaga específica'}.`,
        'high'
      );
    }
  }

  private static async notifyCandidateInterviewApproved(interview: any, candidate: any, company: any, job: any) {
    await NotificationService.createInterviewScheduledNotification(
      interview.candidateId.toString(),
      job?.title || 'Entrevista',
      interview.scheduledDate,
      interview._id.toString()
    );
  }

  private static async notifyCandidateInterviewRejected(interview: IInterview, candidate: any, company: any, job: any) {
    await NotificationService.createGeneralNotification(
      interview.candidateId.toString(),
      'Entrevista Não Aprovada',
      `A entrevista solicitada pela empresa ${company?.name} não foi aprovada pelo administrador.`,
      'medium'
    );
  }

  private static async notifyCompanyInterviewDecision(interview: IInterview, candidate: any, company: any, job: any, action: string) {
    // Buscar usuários da empresa
    const companyUsers = await User.find({ 
      companyId: interview.companyId,
      type: 'empresa'
    });

    for (const user of companyUsers) {
      await NotificationService.createGeneralNotification(
        user._id.toString(),
        `Entrevista ${action === 'approve' ? 'Aprovada' : 'Rejeitada'}`,
        `A entrevista com ${candidate?.name} foi ${action === 'approve' ? 'aprovada' : 'rejeitada'} pelo administrador.`,
        'medium'
      );
    }
  }

  private static async notifyCompanyCandidateResponse(interview: IInterview, candidate: any, company: any, job: any, response: string) {
    // Buscar usuários da empresa
    const companyUsers = await User.find({ 
      companyId: interview.companyId,
      type: 'empresa'
    });

    for (const user of companyUsers) {
      await NotificationService.createGeneralNotification(
        user._id.toString(),
        `Candidato ${response === 'accepted' ? 'Aceitou' : 'Rejeitou'} Entrevista`,
        `${candidate?.name} ${response === 'accepted' ? 'aceitou' : 'rejeitou'} a entrevista agendada.`,
        response === 'accepted' ? 'high' : 'medium'
      );
    }
  }

  private static async notifyAdminCandidateResponse(interview: IInterview, candidate: any, company: any, job: any, response: string) {
    // Buscar todos os admins
    const admins = await User.find({ type: 'admin' });
    
    for (const admin of admins) {
      await NotificationService.createGeneralNotification(
        admin._id.toString(),
        `Candidato ${response === 'accepted' ? 'Aceitou' : 'Rejeitou'} Entrevista`,
        `${candidate?.name} ${response === 'accepted' ? 'aceitou' : 'rejeitou'} a entrevista com ${company?.name}.`,
        'medium'
      );
    }
  }

  private static async notifyAdminFeedbackPending(interview: IInterview, candidate: any, company: any, job: any) {
    // Buscar todos os admins
    const admins = await User.find({ type: 'admin' });
    
    for (const admin of admins) {
      await NotificationService.createGeneralNotification(
        admin._id.toString(),
        'Feedback de Entrevista Pendente',
        `A empresa ${company?.name} enviou feedback da entrevista com ${candidate?.name} e aguarda aprovação.`,
        'medium'
      );
    }
  }

  private static async notifyCandidateFeedbackAvailable(interview: IInterview, candidate: any, company: any, job: any) {
    await NotificationService.createGeneralNotification(
      interview.candidateId.toString(),
      'Feedback da Entrevista Disponível',
      `O feedback da sua entrevista com ${company?.name} foi aprovado e está disponível para visualização.`,
      'medium'
    );
  }
}
