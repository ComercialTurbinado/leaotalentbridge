import { NotificationService } from './NotificationService';
import { EmailService } from './EmailService';
import connectMongoDB from '../mongodb';
import User from '../models/User';
import Company from '../models/Company';
import Job from '../models/Job';
import Application from '../models/Application';

export class NotificationTriggers {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // 1. NOTIFICAÇÕES PARA CANDIDATOS
  async notifyCandidaturaStatusChange(applicationId: string, newStatus: string) {
    try {
      await connectMongoDB();
      
      const application = await Application.findById(applicationId)
        .populate('candidato', 'name email profile')
        .populate('vaga', 'title company');

      if (!application) return;

      const candidato = application.candidato as any;
      const vaga = application.vaga as any;

      // Criar notificação no banco
      await NotificationService.createNotification({
        userId: candidato._id,
        type: 'application_update',
        title: `Status da Candidatura Atualizado`,
        message: `Sua candidatura para "${vaga.title}" foi atualizada para: ${this.getStatusLabel(newStatus)}`,
        priority: 'high',
        data: {
          applicationId,
          jobTitle: vaga.title,
          companyName: vaga.company?.name || 'Empresa',
          newStatus
        }
      });

      // Enviar email
      await this.emailService.sendCandidaturaStatusEmail(
        candidato.email,
        candidato.name,
        vaga.title,
        newStatus,
        vaga.company?.name || 'Empresa'
      );

    } catch (error) {
      console.error('Erro ao notificar mudança de status:', error);
    }
  }

  async notifyEntrevistaAgendada(applicationId: string, entrevistaData: Date) {
    try {
      await connectMongoDB();
      
      const application = await Application.findById(applicationId)
        .populate('candidato', 'name email profile')
        .populate('vaga', 'title company');

      if (!application) return;

      const candidato = application.candidato as any;
      const vaga = application.vaga as any;

      const dataFormatada = new Date(entrevistaData).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Criar notificação no banco
      await NotificationService.createNotification({
        userId: candidato._id,
        type: 'interview_scheduled',
        title: `Entrevista Agendada! 🎯`,
        message: `Você tem uma entrevista para "${vaga.title}" em ${dataFormatada}`,
        priority: 'urgent',
        data: {
          applicationId,
          jobTitle: vaga.title,
          companyName: vaga.company?.name || 'Empresa',
          entrevistaData
        }
      });

      // Enviar email
      await this.emailService.sendEntrevistaEmail(
        candidato.email,
        candidato.name,
        vaga.title,
        entrevistaData,
        vaga.company?.name || 'Empresa'
      );

    } catch (error) {
      console.error('Erro ao notificar entrevista agendada:', error);
    }
  }

  async notifyFeedbackDisponivel(applicationId: string) {
    try {
      await connectMongoDB();
      
      const application = await Application.findById(applicationId)
        .populate('candidato', 'name email profile')
        .populate('vaga', 'title company');

      if (!application) return;

      const candidato = application.candidato as any;
      const vaga = application.vaga as any;

      // Criar notificação no banco
      await NotificationService.createNotification({
        userId: candidato._id,
        type: 'feedback_available',
        title: `Feedback Disponível 📝`,
        message: `O feedback da sua candidatura para "${vaga.title}" está disponível`,
        priority: 'high',
        data: {
          applicationId,
          jobTitle: vaga.title,
          companyName: vaga.company?.name || 'Empresa'
        }
      });

      // Enviar email
      await this.emailService.sendFeedbackEmail(
        candidato.email,
        candidato.name,
        vaga.title,
        vaga.company?.name || 'Empresa'
      );

    } catch (error) {
      console.error('Erro ao notificar feedback disponível:', error);
    }
  }

  // 2. NOTIFICAÇÕES PARA EMPRESAS
  async notifyNovaCandidatura(applicationId: string) {
    try {
      await connectMongoDB();
      
      const application = await Application.findById(applicationId)
        .populate('candidato', 'name email profile')
        .populate('vaga', 'title company')
        .populate('empresa', 'name email');

      if (!application) return;

      const candidato = application.candidato as any;
      const vaga = application.vaga as any;
      const empresa = application.empresa as any;

      // Criar notificação no banco para a empresa
      await NotificationService.createNotification({
        userId: empresa._id,
        type: 'new_application',
        title: `Nova Candidatura Recebida! 🎉`,
        message: `Nova candidatura para "${vaga.title}" de ${candidato.name}`,
        priority: 'high',
        data: {
          applicationId,
          candidatoName: candidato.name,
          candidatoEmail: candidato.email,
          jobTitle: vaga.title,
          applicationDate: new Date()
        }
      });

      // Enviar email para a empresa
      await this.emailService.sendNovaCandidaturaEmail(
        empresa.email,
        empresa.name,
        candidato.name,
        vaga.title
      );

    } catch (error) {
      console.error('Erro ao notificar nova candidatura:', error);
    }
  }

  async notifyVagaExpirada(jobId: string) {
    try {
      await connectMongoDB();
      
      const job = await Job.findById(jobId).populate('company', 'name email');
      if (!job) return;

      const empresa = job.company as any;

      // Criar notificação no banco
      await NotificationService.createNotification({
        userId: empresa._id,
        type: 'system_alert',
        title: `Vaga Expirada ⏰`,
        message: `A vaga "${job.title}" expirou e não receberá mais candidaturas`,
        priority: 'medium',
        data: {
          jobId,
          jobTitle: job.title,
          expiredDate: new Date()
        }
      });

      // Enviar email
      await this.emailService.sendVagaExpiradaEmail(
        empresa.email,
        empresa.name,
        job.title
      );

    } catch (error) {
      console.error('Erro ao notificar vaga expirada:', error);
    }
  }

  // 3. NOTIFICAÇÕES PARA ADMINISTRADORES
  async notifyAdminNovaEmpresa(companyId: string) {
    try {
      await connectMongoDB();
      
      const company = await Company.findById(companyId);
      if (!company) return;

      // Buscar todos os usuários admin
      const admins = await User.find({ type: 'admin' });
      
      for (const admin of admins) {
        // Criar notificação no banco
        await NotificationService.createNotification({
          userId: admin._id,
          type: 'system_alert',
          title: `Nova Empresa Cadastrada 🏢`,
          message: `Nova empresa "${company.name}" se cadastrou na plataforma`,
          priority: 'medium',
          data: {
            companyId,
            companyName: company.name,
            companyEmail: company.email,
            registrationDate: new Date()
          }
        }        );
      }

    } catch (error) {
      console.error('Erro ao notificar admin sobre nova empresa:', error);
    }
  }

  // 4. SISTEMA DE ALERTAS PARA EMPRESAS
  async sendCompanyAlert(companyId: string, alertType: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    try {
      await connectMongoDB();
      
      const company = await Company.findById(companyId);
      if (!company) return;

      // Criar notificação no banco
      await NotificationService.createNotification({
        userId: company._id,
        type: 'system_alert',
        title: `Alerta da Plataforma ⚠️`,
        message,
        priority,
        data: {
          alertType,
          companyId,
          alertDate: new Date()
        }
      });

      // Enviar email de alerta
      await this.emailService.sendCompanyAlertEmail(
        company.email,
        company.name,
        alertType,
        message
      );

    } catch (error) {
      console.error('Erro ao enviar alerta para empresa:', error);
    }
  }

  // 5. UTILITÁRIOS
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

  // 6. TRIGGERS AUTOMÁTICOS BASEADOS EM EVENTOS
  async handleApplicationStatusChange(applicationId: string, oldStatus: string, newStatus: string) {
    // Notificar candidato sobre mudança de status
    await this.notifyCandidaturaStatusChange(applicationId, newStatus);
    
    // Se foi aprovado, agendar entrevista automática
    if (newStatus === 'approved') {
      // Aqui você pode implementar lógica para agendar entrevista
      console.log(`Candidatura ${applicationId} aprovada - entrevista pode ser agendada`);
    }
  }

  async handleNewApplication(applicationId: string) {
    // Notificar empresa sobre nova candidatura
    await this.notifyNovaCandidatura(applicationId);
    
    // Notificar admin sobre nova candidatura (opcional)
    // await this.notifyAdminNovaCandidatura(applicationId);
  }

  async handleJobExpiration(jobId: string) {
    // Notificar empresa sobre vaga expirada
    await this.notifyVagaExpirada(jobId);
  }

  async handleNewCompanyRegistration(companyId: string) {
    // Notificar admin sobre nova empresa
    await this.notifyAdminNovaEmpresa(companyId);
  }
}

export default NotificationTriggers;
