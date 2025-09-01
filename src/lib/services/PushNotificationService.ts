import webpush from 'web-push';

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static initialized = false;

  private static initialize() {
    if (!this.initialized) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@leao-careers.com',
        process.env.VAPID_PUBLIC_KEY || '',
        process.env.VAPID_PRIVATE_KEY || ''
      );
      this.initialized = true;
    }
  }

  /**
   * Envia notificação push para um usuário
   */
  static async sendPushNotification(
    subscription: PushSubscription,
    notification: PushNotificationData
  ): Promise<boolean> {
    try {
      this.initialize();

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icons/icon-192x192.png',
        badge: notification.badge || '/icons/badge-72x72.png',
        image: notification.image,
        url: notification.url,
        data: notification.data,
        actions: notification.actions,
        timestamp: Date.now()
      });

      await webpush.sendNotification(subscription, payload);
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação push:', error);
      return false;
    }
  }

  /**
   * Envia notificação push para múltiplos usuários
   */
  static async sendBulkPushNotification(
    subscriptions: PushSubscription[],
    notification: PushNotificationData
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendPushNotification(sub, notification))
    );

    const success = results.filter(result => result.status === 'fulfilled' && result.value).length;
    const failed = results.length - success;

    return { success, failed };
  }

  /**
   * Templates de notificações push
   */
  static getPushTemplates() {
    return {
      // Convite para entrevista
      interviewInvitation: (companyName: string, interviewDate: string): PushNotificationData => ({
        title: '🎯 Convite para Entrevista',
        body: `${companyName} convidou você para uma entrevista em ${interviewDate}`,
        url: '/candidato/entrevistas',
        data: { type: 'interview_invitation' },
        actions: [
          { action: 'accept', title: 'Aceitar' },
          { action: 'reject', title: 'Rejeitar' }
        ]
      }),

      // Resposta de entrevista
      interviewResponse: (candidateName: string, response: 'accepted' | 'rejected'): PushNotificationData => ({
        title: response === 'accepted' ? '✅ Entrevista Aceita' : '❌ Entrevista Rejeitada',
        body: `${candidateName} ${response === 'accepted' ? 'aceitou' : 'rejeitou'} o convite para entrevista`,
        url: '/empresa/entrevistas',
        data: { type: 'interview_response', response }
      }),

      // Feedback disponível
      feedbackAvailable: (companyName: string): PushNotificationData => ({
        title: '📊 Feedback Disponível',
        body: `Feedback da entrevista com ${companyName} está disponível`,
        url: '/candidato/entrevistas',
        data: { type: 'feedback_available' }
      }),

      // Nova candidatura
      newApplication: (candidateName: string, jobTitle: string): PushNotificationData => ({
        title: '📝 Nova Candidatura',
        body: `${candidateName} se candidatou para ${jobTitle}`,
        url: '/empresa/candidaturas',
        data: { type: 'new_application' }
      }),

      // Atualização de status
      applicationUpdate: (jobTitle: string, status: string): PushNotificationData => {
        const statusEmojis = {
          'shortlisted': '🎯',
          'interview': '🎯',
          'rejected': '❌',
          'hired': '🎉',
          'pending': '⏳'
        };
        const emoji = statusEmojis[status as keyof typeof statusEmojis] || '📋';
        
        return {
          title: `${emoji} Status Atualizado`,
          body: `Sua candidatura para ${jobTitle} foi atualizada para ${status}`,
          url: '/candidato/candidaturas',
          data: { type: 'application_update', status }
        };
      },

      // Recomendação de vaga
      jobRecommendation: (jobTitle: string, matchPercentage: number): PushNotificationData => ({
        title: '💼 Nova Vaga Recomendada',
        body: `${jobTitle} - ${matchPercentage}% de compatibilidade`,
        url: '/candidato/vagas',
        data: { type: 'job_recommendation', matchPercentage }
      }),

      // Lembrete de entrevista
      interviewReminder: (companyName: string, timeUntil: string): PushNotificationData => ({
        title: '⏰ Lembrete de Entrevista',
        body: `Entrevista com ${companyName} em ${timeUntil}`,
        url: '/candidato/entrevistas',
        data: { type: 'interview_reminder' }
      }),

      // Feedback pendente (admin)
      feedbackPending: (candidateName: string, companyName: string): PushNotificationData => ({
        title: '📝 Feedback Pendente',
        body: `Feedback de ${candidateName} (${companyName}) aguardando aprovação`,
        url: '/admin/entrevistas',
        data: { type: 'feedback_pending' }
      }),

      // Sistema de alertas
      systemAlert: (title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent'): PushNotificationData => {
        const priorityEmojis = {
          'urgent': '🚨',
          'high': '⚠️',
          'medium': 'ℹ️',
          'low': '💡'
        };
        
        return {
          title: `${priorityEmojis[priority]} ${title}`,
          body: message,
          url: '/dashboard',
          data: { type: 'system_alert', priority }
        };
      }
    };
  }

  /**
   * Valida se uma subscription é válida
   */
  static async validateSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      this.initialize();
      
      // Tenta enviar uma notificação de teste
      await webpush.sendNotification(subscription, JSON.stringify({
        title: 'Teste',
        body: 'Teste de conexão',
        data: { test: true }
      }));
      
      return true;
    } catch (error) {
      console.error('Subscription inválida:', error);
      return false;
    }
  }

  /**
   * Gera chaves VAPID (para desenvolvimento)
   */
  static generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
  }
}
