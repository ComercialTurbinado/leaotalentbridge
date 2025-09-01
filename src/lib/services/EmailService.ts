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
}
