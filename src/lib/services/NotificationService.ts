import { INotification } from '@/lib/models/Notification';
import Notification from '@/lib/models/Notification';
import { INotificationPreferences } from '@/lib/models/NotificationPreferences';
import NotificationPreferences from '@/lib/models/NotificationPreferences';
import { EmailService } from './EmailService';
import { PushNotificationService } from './PushNotificationService';
import User from '@/lib/models/User';

export interface CreateNotificationData {
  userId: string;
  type: 'job_recommendation' | 'application_update' | 'document_status' | 'interview_scheduled' | 'interview_invitation' | 'interview_response' | 'feedback_available' | 'feedback_pending' | 'new_application' | 'system_alert' | 'general';
  title: string;
  message: string;
  data?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  scheduledFor?: Date;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export class NotificationService {
  /**
   * Cria uma nova notificação
   */
  static async createNotification(data: CreateNotificationData): Promise<INotification> {
    const notification = new Notification({
      ...data,
      expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      delivery: {
        email: { sent: false },
        push: { sent: false },
        sms: { sent: false }
      }
    });

    const savedNotification = await notification.save();

    // Enviar notificações se solicitado
    if (data.sendEmail || data.sendPush) {
      await this.sendNotification(savedNotification);
    }

    return savedNotification;
  }

  /**
   * Envia notificação por email e/ou push
   */
  static async sendNotification(notification: INotification): Promise<void> {
    try {
      const user = await User.findById(notification.userId);
      if (!user) return;

      const preferences = await this.getUserPreferences(notification.userId.toString());
      
      // Verificar se deve enviar email
      if (this.shouldSendEmail(notification, preferences)) {
        await this.sendEmailNotification(notification, user, preferences);
      }

      // Verificar se deve enviar push
      if (this.shouldSendPush(notification, preferences)) {
        await this.sendPushNotification(notification, user, preferences);
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  /**
   * Verifica se deve enviar email
   */
  private static shouldSendEmail(notification: INotification, preferences: INotificationPreferences | null): boolean {
    if (!preferences?.emailNotifications) return false;
    if (!preferences.preferences[this.getPreferenceKey(notification.type)]) return false;
    
    // Verificar horário de silêncio
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('pt-BR', { 
        timeZone: preferences.quietHours.timezone,
        hour12: false 
      });
      
      if (this.isInQuietHours(currentTime, preferences.quietHours.startTime, preferences.quietHours.endTime)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica se deve enviar push
   */
  private static shouldSendPush(notification: INotification, preferences: INotificationPreferences | null): boolean {
    if (!preferences?.pushNotifications) return false;
    if (!preferences.preferences[this.getPreferenceKey(notification.type)]) return false;
    
    // Verificar horário de silêncio
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('pt-BR', { 
        timeZone: preferences.quietHours.timezone,
        hour12: false 
      });
      
      if (this.isInQuietHours(currentTime, preferences.quietHours.startTime, preferences.quietHours.endTime)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Mapeia tipo de notificação para chave de preferência
   */
  private static getPreferenceKey(type: string): string {
    const mapping: { [key: string]: string } = {
      'job_recommendation': 'newJobRecommendations',
      'application_update': 'applicationStatusUpdates',
      'interview_invitation': 'interviewInvitations',
      'interview_scheduled': 'interviewReminders',
      'feedback_available': 'feedbackAvailable',
      'new_application': 'newApplications',
      'interview_response': 'interviewResponses',
      'feedback_pending': 'feedbackPending'
    };
    return mapping[type] || 'systemUpdates';
  }

  /**
   * Verifica se está em horário de silêncio
   */
  private static isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Horário cruza meia-noite
      return current >= start || current <= end;
    }
  }

  /**
   * Converte tempo HH:MM para minutos
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Envia notificação por email
   */
  private static async sendEmailNotification(
    notification: INotification, 
    user: any, 
    preferences: INotificationPreferences | null
  ): Promise<void> {
    try {
      const templates = EmailService.getEmailTemplates();
      let emailTemplate;

      // Selecionar template baseado no tipo
      switch (notification.type) {
        case 'interview_invitation':
          emailTemplate = templates.interviewInvitation(
            user.name,
            notification.data?.companyName || 'Empresa',
            notification.data?.interviewDate || '',
            notification.data?.interviewTitle || 'Entrevista',
            notification.data?.actionUrl || ''
          );
          break;
        case 'interview_response':
          emailTemplate = templates.interviewResponse(
            notification.data?.companyName || 'Empresa',
            user.name,
            notification.data?.response || 'accepted',
            notification.data?.interviewDate || ''
          );
          break;
        case 'feedback_available':
          emailTemplate = templates.feedbackAvailable(
            user.name,
            notification.data?.companyName || 'Empresa',
            notification.data?.actionUrl || ''
          );
          break;
        case 'new_application':
          emailTemplate = templates.newApplication(
            notification.data?.companyName || 'Empresa',
            user.name,
            notification.data?.jobTitle || 'Vaga',
            notification.data?.actionUrl || ''
          );
          break;
        case 'application_update':
          emailTemplate = templates.applicationUpdate(
            user.name,
            notification.data?.jobTitle || 'Vaga',
            notification.data?.companyName || 'Empresa',
            notification.data?.status || 'Atualizado'
          );
          break;
        case 'job_recommendation':
          emailTemplate = templates.jobRecommendation(
            user.name,
            notification.data?.jobTitle || 'Vaga',
            notification.data?.matchPercentage || 0,
            notification.data?.actionUrl || ''
          );
          break;
        case 'feedback_pending':
          emailTemplate = templates.feedbackPending(
            user.name,
            notification.data?.candidateName || 'Candidato',
            notification.data?.companyName || 'Empresa',
            notification.data?.actionUrl || ''
          );
          break;
        default:
          emailTemplate = templates.base(notification.message, notification.data?.actionUrl, 'Ver Detalhes');
      }

      const success = await EmailService.sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      // Atualizar status de entrega
      await Notification.findByIdAndUpdate(notification._id, {
        'delivery.email.sent': success,
        'delivery.email.sentAt': success ? new Date() : undefined,
        'delivery.email.failed': !success
      });

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'delivery.email.failed': true,
        'delivery.email.error': error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Envia notificação push
   */
  private static async sendPushNotification(
    notification: INotification, 
    user: any, 
    preferences: INotificationPreferences | null
  ): Promise<void> {
    try {
      // Aqui você implementaria a lógica para buscar as subscriptions do usuário
      // Por enquanto, vamos simular
      const subscriptions = user.pushSubscriptions || [];

      if (subscriptions.length === 0) return;

      const templates = PushNotificationService.getPushTemplates();
      let pushTemplate;

      // Selecionar template baseado no tipo
      switch (notification.type) {
        case 'interview_invitation':
          pushTemplate = templates.interviewInvitation(
            notification.data?.companyName || 'Empresa',
            notification.data?.interviewDate || ''
          );
          break;
        case 'interview_response':
          pushTemplate = templates.interviewResponse(
            user.name,
            notification.data?.response || 'accepted'
          );
          break;
        case 'feedback_available':
          pushTemplate = templates.feedbackAvailable(
            notification.data?.companyName || 'Empresa'
          );
          break;
        case 'new_application':
          pushTemplate = templates.newApplication(
            user.name,
            notification.data?.jobTitle || 'Vaga'
          );
          break;
        case 'application_update':
          pushTemplate = templates.applicationUpdate(
            notification.data?.jobTitle || 'Vaga',
            notification.data?.status || 'Atualizado'
          );
          break;
        case 'job_recommendation':
          pushTemplate = templates.jobRecommendation(
            notification.data?.jobTitle || 'Vaga',
            notification.data?.matchPercentage || 0
          );
          break;
        case 'feedback_pending':
          pushTemplate = templates.feedbackPending(
            user.name,
            notification.data?.companyName || 'Empresa'
          );
          break;
        default:
          pushTemplate = {
            title: notification.title,
            body: notification.message,
            url: notification.data?.actionUrl || '/dashboard',
            data: { type: notification.type }
          };
      }

      const result = await PushNotificationService.sendBulkPushNotification(subscriptions, pushTemplate);

      // Atualizar status de entrega
      await Notification.findByIdAndUpdate(notification._id, {
        'delivery.push.sent': result.success > 0,
        'delivery.push.sentAt': result.success > 0 ? new Date() : undefined,
        'delivery.push.failed': result.failed > 0
      });

    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'delivery.push.failed': true,
        'delivery.push.error': error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca notificações de um usuário
   */
  static async getUserNotifications(
    userId: string, 
    options: {
      limit?: number;
      unreadOnly?: boolean;
      type?: string;
    } = {}
  ): Promise<INotification[]> {
    const { limit = 20, unreadOnly = false, type } = options;

    const query: any = {
      userId,
      expiresAt: { $gt: new Date() }
    };

    if (unreadOnly) {
      query.read = false;
    }

    if (type) {
      query.type = type;
    }

    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Marca notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await Notification.findByIdAndUpdate(notificationId, {
      read: true,
      readAt: new Date()
    });
  }

  /**
   * Marca todas as notificações como lidas
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  /**
   * Conta notificações não lidas
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({
      userId,
      read: false,
      expiresAt: { $gt: new Date() }
    });
  }

  /**
   * Remove notificação
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Remove notificações expiradas
   */
  static async cleanupExpiredNotifications(): Promise<void> {
    await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }

  /**
   * Cria notificação de recomendação de vaga
   */
  static async createJobRecommendationNotification(
    userId: string, 
    jobTitle: string, 
    matchPercentage: number,
    jobId: string
  ): Promise<INotification> {
    return await this.createNotification({
      userId,
      type: 'job_recommendation',
      title: 'Nova vaga recomendada para você!',
      message: `Encontramos uma vaga de ${jobTitle} com ${matchPercentage}% de compatibilidade com seu perfil.`,
      data: { jobId, matchPercentage },
      priority: matchPercentage > 85 ? 'high' : 'medium'
    });
  }

  /**
   * Cria notificação de atualização de candidatura
   */
  static async createApplicationUpdateNotification(
    userId: string,
    jobTitle: string,
    status: string,
    applicationId: string
  ): Promise<INotification> {
    const statusMessages = {
      'reviewed': 'sua candidatura foi analisada',
      'shortlisted': 'você foi pré-selecionado',
      'interview_scheduled': 'uma entrevista foi agendada',
      'rejected': 'sua candidatura não foi selecionada',
      'accepted': 'parabéns! Você foi selecionado'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 'houve uma atualização';

    return await this.createNotification({
      userId,
      type: 'application_update',
      title: `Atualização na candidatura: ${jobTitle}`,
      message: `Informamos que ${message} para a vaga de ${jobTitle}.`,
      data: { applicationId, status, jobTitle },
      priority: status === 'accepted' ? 'urgent' : 'medium'
    });
  }

  /**
   * Cria notificação de status de documento
   */
  static async createDocumentStatusNotification(
    userId: string,
    documentType: string,
    status: string,
    documentId: string
  ): Promise<INotification> {
    const statusMessages = {
      'verified': 'foi aprovado',
      'rejected': 'foi rejeitado',
      'under_review': 'está em análise'
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 'teve seu status atualizado';

    return await this.createNotification({
      userId,
      type: 'document_status',
      title: `Documento ${message}`,
      message: `Seu documento de ${documentType} ${message}.`,
      data: { documentId, status, documentType },
      priority: status === 'rejected' ? 'high' : 'low'
    });
  }

  /**
   * Cria notificação de entrevista agendada
   */
  static async createInterviewScheduledNotification(
    userId: string,
    jobTitle: string,
    interviewDate: Date,
    interviewId: string
  ): Promise<INotification> {
    const formattedDate = interviewDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return await this.createNotification({
      userId,
      type: 'interview_scheduled',
      title: 'Entrevista agendada!',
      message: `Sua entrevista para a vaga de ${jobTitle} foi agendada para ${formattedDate}.`,
      data: { interviewId, jobTitle, interviewDate },
      priority: 'high'
    });
  }

  /**
   * Cria notificação geral
   */
  static async createGeneralNotification(
    userId: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<INotification> {
    return await this.createNotification({
      userId,
      type: 'general',
      title,
      message,
      priority
    });
  }

  /**
   * Envia notificação para múltiplos usuários
   */
  static async broadcastNotification(
    userIds: string[],
    title: string,
    message: string,
    type: 'general' = 'general',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      type,
      title,
      message,
      priority,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      delivery: {
        email: { sent: false },
        push: { sent: false },
        sms: { sent: false }
      }
    }));

    await Notification.insertMany(notifications);
  }

  /**
   * Busca preferências de notificação do usuário
   */
  static async getUserPreferences(userId: string): Promise<INotificationPreferences | null> {
    return await NotificationPreferences.findOne({ userId });
  }

  /**
   * Cria ou atualiza preferências de notificação
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<INotificationPreferences>
  ): Promise<INotificationPreferences> {
    return await NotificationPreferences.findOneAndUpdate(
      { userId },
      { ...preferences, userId },
      { upsert: true, new: true }
    );
  }

  /**
   * Cria preferências padrão para um novo usuário
   */
  static async createDefaultPreferences(userId: string, userRole: string): Promise<INotificationPreferences> {
    const defaultPreferences: any = {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
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
    };

    // Configurações específicas por role
    if (userRole === 'candidato') {
      defaultPreferences.preferences = {
        newJobRecommendations: true,
        applicationStatusUpdates: true,
        interviewInvitations: true,
        interviewReminders: true,
        feedbackAvailable: true,
        documentRequests: true,
        simulationInvitations: true
      };
    } else if (userRole === 'empresa') {
      defaultPreferences.preferences = {
        newApplications: true,
        applicationUpdates: true,
        interviewResponses: true,
        candidateFeedback: true,
        jobExpiryReminders: true,
        systemUpdates: true
      };
    } else if (userRole === 'admin') {
      defaultPreferences.preferences = {
        newInterviews: true,
        feedbackPending: true,
        systemAlerts: true,
        userReports: true,
        maintenanceAlerts: true
      };
    }

    return await NotificationPreferences.create(defaultPreferences);
  }

  /**
   * Envia notificação com base nas preferências do usuário
   */
  static async sendSmartNotification(data: CreateNotificationData): Promise<INotification> {
    const preferences = await this.getUserPreferences(data.userId);
    
    if (!preferences) {
      // Criar preferências padrão se não existirem
      const user = await User.findById(data.userId);
      if (user) {
        await this.createDefaultPreferences(data.userId, user.role);
      }
    }

    return await this.createNotification({
      ...data,
      sendEmail: true,
      sendPush: true
    });
  }

  /**
   * Agenda notificação para envio posterior
   */
  static async scheduleNotification(
    data: CreateNotificationData,
    scheduledFor: Date
  ): Promise<INotification> {
    return await this.createNotification({
      ...data,
      scheduledFor,
      sendEmail: false,
      sendPush: false
    });
  }

  /**
   * Processa notificações agendadas
   */
  static async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await Notification.find({
      scheduledFor: { $lte: now },
      'delivery.email.sent': false,
      'delivery.push.sent': false
    });

    for (const notification of scheduledNotifications) {
      await this.sendNotification(notification);
    }
  }
}
