import nodemailer from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    return this.transporter;
  }

  /**
   * Envia um email
   */
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: emailData.from || process.env.SMTP_FROM || 'noreply@leao-careers.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.htmlToText(emailData.html)
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Converte HTML para texto simples
   */
  private static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Templates de email para diferentes tipos de notificação
   */
  static getEmailTemplates() {
    return {
      // Template base
      base: (content: string, actionUrl?: string, actionText?: string): EmailTemplate => ({
        subject: 'UAE Careers - Notificação',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UAE Careers</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; background: #f8fafc; }
              .footer { padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .button:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🦁 UAE Careers</h1>
                <p>Conectando talentos aos Emirados Árabes Unidos</p>
              </div>
              <div class="content">
                ${content}
                ${actionUrl && actionText ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ''}
              </div>
              <div class="footer">
                <p>Esta é uma mensagem automática do UAE Careers.</p>
                <p>Se você não deseja receber mais emails, pode alterar suas preferências em seu perfil.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: content
      }),

      // Convite para entrevista
      interviewInvitation: (candidateName: string, companyName: string, interviewDate: string, interviewTitle: string, actionUrl: string): EmailTemplate => {
        const content = `
          <h2>🎯 Convite para Entrevista</h2>
          <p>Olá <strong>${candidateName}</strong>,</p>
          <p>A empresa <strong>${companyName}</strong> convidou você para uma entrevista!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${interviewTitle}</h3>
            <p><strong>📅 Data:</strong> ${interviewDate}</p>
            <p>Clique no botão abaixo para aceitar ou rejeitar o convite.</p>
          </div>
        `;
        return EmailService.getEmailTemplates().base(content, actionUrl, 'Responder ao Convite');
      },

      // Resposta de entrevista
      interviewResponse: (companyName: string, candidateName: string, response: 'accepted' | 'rejected', interviewDate: string): EmailTemplate => {
        const responseText = response === 'accepted' ? 'aceitou' : 'rejeitou';
        const emoji = response === 'accepted' ? '✅' : '❌';
        const content = `
          <h2>${emoji} Resposta de Entrevista</h2>
          <p>Olá <strong>${companyName}</strong>,</p>
          <p>O candidato <strong>${candidateName}</strong> ${responseText} o convite para entrevista.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Data da Entrevista:</strong> ${interviewDate}</p>
            <p><strong>Status:</strong> ${response === 'accepted' ? 'Confirmada' : 'Cancelada'}</p>
          </div>
        `;
        return EmailService.getEmailTemplates().base(content);
      },

      // Feedback disponível
      feedbackAvailable: (candidateName: string, companyName: string, actionUrl: string): EmailTemplate => {
        const content = `
          <h2>📊 Feedback da Entrevista Disponível</h2>
          <p>Olá <strong>${candidateName}</strong>,</p>
          <p>O feedback da sua entrevista com <strong>${companyName}</strong> está disponível!</p>
          <p>Clique no botão abaixo para visualizar sua avaliação e comentários.</p>
        `;
        return EmailService.getEmailTemplates().base(content, actionUrl, 'Ver Feedback');
      },

      // Nova candidatura
      newApplication: (companyName: string, candidateName: string, jobTitle: string, actionUrl: string): EmailTemplate => {
        const content = `
          <h2>📝 Nova Candidatura Recebida</h2>
          <p>Olá <strong>${companyName}</strong>,</p>
          <p>Você recebeu uma nova candidatura!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Candidato:</strong> ${candidateName}</p>
            <p><strong>💼 Vaga:</strong> ${jobTitle}</p>
          </div>
          <p>Clique no botão abaixo para revisar a candidatura.</p>
        `;
        return EmailService.getEmailTemplates().base(content, actionUrl, 'Revisar Candidatura');
      },

      // Atualização de status de candidatura
      applicationUpdate: (candidateName: string, jobTitle: string, companyName: string, status: string): EmailTemplate => {
        const statusEmojis = {
          'shortlisted': '🎯',
          'interview': '🎯',
          'rejected': '❌',
          'hired': '🎉',
          'pending': '⏳'
        };
        const emoji = statusEmojis[status as keyof typeof statusEmojis] || '📋';
        const content = `
          <h2>${emoji} Atualização de Candidatura</h2>
          <p>Olá <strong>${candidateName}</strong>,</p>
          <p>O status da sua candidatura foi atualizado!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💼 Vaga:</strong> ${jobTitle}</p>
            <p><strong>🏢 Empresa:</strong> ${companyName}</p>
            <p><strong>📊 Status:</strong> ${status}</p>
          </div>
        `;
        return EmailService.getEmailTemplates().base(content);
      },

      // Recomendação de vaga
      jobRecommendation: (candidateName: string, jobTitle: string, matchPercentage: number, actionUrl: string): EmailTemplate => {
        const content = `
          <h2>💼 Nova Vaga Recomendada</h2>
          <p>Olá <strong>${candidateName}</strong>,</p>
          <p>Encontramos uma vaga que pode ser perfeita para você!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>💼 Vaga:</strong> ${jobTitle}</p>
            <p><strong>🎯 Compatibilidade:</strong> ${matchPercentage}%</p>
          </div>
          <p>Clique no botão abaixo para ver mais detalhes e se candidatar.</p>
        `;
        return EmailService.getEmailTemplates().base(content, actionUrl, 'Ver Vaga');
      },

      // Lembrete de entrevista
      interviewReminder: (candidateName: string, companyName: string, interviewDate: string, interviewTitle: string): EmailTemplate => {
        const content = `
          <h2>⏰ Lembrete de Entrevista</h2>
          <p>Olá <strong>${candidateName}</strong>,</p>
          <p>Este é um lembrete sobre sua entrevista que está chegando!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>🏢 Empresa:</strong> ${companyName}</p>
            <p><strong>💼 Entrevista:</strong> ${interviewTitle}</p>
            <p><strong>📅 Data:</strong> ${interviewDate}</p>
          </div>
          <p>Boa sorte na sua entrevista! 🍀</p>
        `;
        return EmailService.getEmailTemplates().base(content);
      },

      // Feedback pendente (para admin)
      feedbackPending: (adminName: string, candidateName: string, companyName: string, actionUrl: string): EmailTemplate => {
        const content = `
          <h2>📝 Feedback Pendente de Aprovação</h2>
          <p>Olá <strong>${adminName}</strong>,</p>
          <p>Há um feedback de entrevista aguardando sua aprovação.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👤 Candidato:</strong> ${candidateName}</p>
            <p><strong>🏢 Empresa:</strong> ${companyName}</p>
          </div>
          <p>Clique no botão abaixo para revisar e aprovar o feedback.</p>
        `;
        return EmailService.getEmailTemplates().base(content, actionUrl, 'Revisar Feedback');
      }
    };
  }

  // 7. EMAILS PARA NOTIFICAÇÕES AUTOMÁTICAS
  async sendCandidaturaStatusEmail(
    email: string,
    candidatoName: string,
    jobTitle: string,
    newStatus: string,
    companyName: string
  ) {
    const statusLabel = this.getStatusLabel(newStatus);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">Status da Candidatura Atualizado</h1>
          
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Olá <strong>${candidatoName}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              O status da sua candidatura foi atualizado:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #d4af37;">
              <h3 style="color: #333; margin: 0 0 10px 0;">Vaga: ${jobTitle}</h3>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>Empresa:</strong> ${companyName}</p>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>Novo Status:</strong> <span style="color: #d4af37; font-weight: bold;">${statusLabel}</span></p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Acesse sua conta para mais detalhes sobre a candidatura.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Leão Talent Bridge - Conectando talentos e oportunidades
            </p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendEmail({ to: email, subject: 'Status da Candidatura Atualizado', html: html });
  }

  async sendEntrevistaEmail(
    email: string,
    candidatoName: string,
    jobTitle: string,
    entrevistaData: Date,
    companyName: string
  ) {
    const dataFormatada = new Date(entrevistaData).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">🎯 Entrevista Agendada!</h1>
          
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Parabéns <strong>${candidatoName}</strong>! 🎉</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Sua candidatura foi aprovada e uma entrevista foi agendada:
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin: 0 0 10px 0;">📋 Vaga: ${jobTitle}</h3>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>🏢 Empresa:</strong> ${companyName}</p>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>📅 Data/Hora:</strong> <span style="color: #28a745; font-weight: bold;">${dataFormatada}</span></p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>💡 Dica:</strong> Prepare-se para a entrevista revisando sua experiência e os requisitos da vaga.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Boa sorte! Acesse sua conta para mais detalhes.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Leão Talent Bridge - Conectando talentos e oportunidades
            </p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendEmail({ to: email, subject: '🎯 Entrevista Agendada!', html: html });
  }

  async sendFeedbackEmail(
    email: string,
    candidatoName: string,
    jobTitle: string,
    companyName: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">📝 Feedback Disponível</h1>
          
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Olá <strong>${candidatoName}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              O feedback da sua candidatura está disponível:
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #17a2b8;">
              <h3 style="color: #333; margin: 0 0 10px 0;">📋 Vaga: ${jobTitle}</h3>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>🏢 Empresa:</strong> ${companyName}</p>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>📊 Status:</strong> <span style="color: #17a2b8; font-weight: bold;">Feedback Disponível</span></p>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 6px; border-left: 4px solid #17a2b8; margin-top: 20px;">
              <p style="color: #0c5460; margin: 0; font-size: 14px;">
                <strong>💡 Importante:</strong> Acesse sua conta para visualizar o feedback completo da empresa.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Use esse feedback para melhorar suas próximas candidaturas!
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Leão Talent Bridge - Conectando talentos e oportunidades
            </p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendEmail({ to: email, subject: '📝 Feedback Disponível', html: html });
  }

  async sendNovaCandidaturaEmail(
    email: string,
    companyName: string,
    candidatoName: string,
    jobTitle: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">🎉 Nova Candidatura Recebida!</h1>
          
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Olá <strong>${companyName}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Você recebeu uma nova candidatura para uma de suas vagas:
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin: 0 0 10px 0;">👤 Candidato: ${candidatoName}</h3>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>📋 Vaga:</strong> ${jobTitle}</p>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>📅 Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin-top: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚡ Ação:</strong> Acesse sua conta para revisar a candidatura e tomar as próximas ações.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Não perca essa oportunidade de encontrar o talento ideal!
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Leão Talent Bridge - Conectando talentos e oportunidades
            </p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendEmail({ to: email, subject: '🎉 Nova Candidatura Recebida!', html: html });
  }

  async sendVagaExpiradaEmail(
    email: string,
    companyName: string,
    jobTitle: string
  ) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">⏰ Vaga Expirada</h1>
          
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Olá <strong>${companyName}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Uma de suas vagas expirou e não receberá mais candidaturas:
            </p>
            
            <div style="background: #f8d7da; padding: 20px; border-radius: 6px; border-left: 4px solid #dc3545;">
              <h3 style="color: #333; margin: 0 0 10px 0;">📋 Vaga: ${jobTitle}</h3>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>⏰ Status:</strong> <span style="color: #dc3545; font-weight: bold;">Expirada</span></p>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>📅 Data de Expiração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 6px; border-left: 4px solid #17a2b8; margin-top: 20px;">
              <p style="color: #0c5460; margin: 0; font-size: 14px;">
                <strong>💡 Opções:</strong> Você pode renovar a vaga ou criar uma nova com base na anterior.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Acesse sua conta para gerenciar suas vagas.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Leão Talent Bridge - Conectando talentos e oportunidades
            </p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendEmail({ to: email, subject: '⏰ Vaga Expirada', html: html });
  }

  async sendCompanyAlertEmail(
    email: string,
    companyName: string,
    alertType: string,
    message: string
  ) {
    const alertTypeLabels: { [key: string]: string } = {
      'security': 'Segurança',
      'maintenance': 'Manutenção',
      'update': 'Atualização',
      'warning': 'Aviso',
      'info': 'Informação'
    };

    const alertTypeLabel = alertTypeLabels[alertType] || alertType;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #d4af37; text-align: center; margin-bottom: 30px;">⚠️ Alerta da Plataforma</h1>
          
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 15px;">Olá <strong>${companyName}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Recebemos um alerta importante da plataforma:
            </p>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107;">
              <h3 style="color: #333; margin: 0 0 10px 0;">⚠️ Tipo de Alerta: ${alertTypeLabel}</h3>
              <p style="color: #333; margin: 0 0 10px 0;"><strong>📝 Mensagem:</strong></p>
              <p style="color: #333; margin: 0; font-style: italic;">"${message}"</p>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 6px; border-left: 4px solid #17a2b8; margin-top: 20px;">
              <p style="color: #0c5460; margin: 0; font-size: 14px;">
                <strong>ℹ️ Informação:</strong> Este é um alerta automático da plataforma Leão Talent Bridge.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Se tiver dúvidas, entre em contato com nosso suporte.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #999; font-size: 12px;">
              Leão Talent Bridge - Conectando talentos e oportunidades
            </p>
          </div>
        </div>
      </div>
    `;

    return EmailService.sendEmail({ to: email, subject: '⚠️ Alerta da Plataforma', html: html });
  }

  // 8. UTILITÁRIOS
  private getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Pendente',
      'reviewing': 'Em Análise',
      'interviewing': 'Entrevistando',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado',
      'withdrawn': 'Retirado'
    };
    
    return statusLabels[status] || status;
  }
}
