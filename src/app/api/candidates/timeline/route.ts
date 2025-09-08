import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import Application from '@/lib/models/Application';
import Interview from '@/lib/models/Interview';
import Job from '@/lib/models/Job';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;

    // Buscar candidaturas
    const query: any = { candidateId: user._id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title company location salaryRange')
      .populate('jobId.company', 'name industry')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Buscar entrevistas relacionadas
    const applicationIds = applications.map(app => app._id);
    const interviews = await Interview.find({
      applicationId: { $in: applicationIds }
    }).sort({ scheduledAt: -1 });

    // Criar timeline
    const timeline = applications.map(application => {
      const job = application.jobId as any;
      const relatedInterviews = interviews.filter(int => 
        int.applicationId.toString() === application._id.toString()
      );

      const timelineEvents = [
        {
          id: `app-${application._id}`,
          type: 'application',
          title: 'Candidatura enviada',
          description: `Você se candidatou para a vaga de ${job?.title || 'Vaga'}`,
          date: application.createdAt,
          status: 'completed',
          data: {
            applicationId: application._id,
            jobTitle: job?.title,
            companyName: job?.company?.name
          }
        }
      ];

      // Adicionar eventos de status
      if (application.status !== 'pending') {
        timelineEvents.push({
          id: `status-${application._id}`,
          type: 'status_update',
          title: getStatusTitle(application.status),
          description: getStatusDescription(application.status, job?.title),
          date: application.updatedAt,
          status: getStatusType(application.status),
          data: {
            applicationId: application._id,
            jobTitle: job?.title,
            companyName: job?.company?.name
          }
        });
      }

      // Adicionar entrevistas
      relatedInterviews.forEach(interview => {
        timelineEvents.push({
          id: `interview-${interview._id}`,
          type: 'interview',
          title: 'Entrevista agendada',
          description: `Entrevista para ${job?.title} em ${interview.scheduledAt.toLocaleDateString('pt-BR')}`,
          date: interview.scheduledAt,
          status: interview.status === 'completed' ? 'completed' : 
                  interview.status === 'cancelled' ? 'cancelled' : 'pending',
          data: {
            applicationId: application._id,
            jobTitle: job?.title,
            companyName: job?.company?.name
          }
        });
      });

      // Ordenar eventos por data
      timelineEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        application: {
          id: application._id,
          jobTitle: job?.title,
          companyName: job?.company?.name,
          companyIndustry: job?.company?.industry,
          location: job?.location,
          salaryRange: job?.salaryRange,
          status: application.status,
          appliedAt: application.createdAt,
          updatedAt: application.updatedAt
        },
        timeline: timelineEvents,
        progress: calculateProgress(application.status, relatedInterviews.length)
      };
    });

    // Estatísticas gerais
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      withInterviews: applications.filter(app => 
        interviews.some(int => int.applicationId.toString() === app._id.toString())
      ).length
    };

    return NextResponse.json({
      timeline,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar timeline:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getStatusTitle(status: string): string {
  const titles = {
    'pending': 'Candidatura em análise',
    'reviewed': 'Candidatura analisada',
    'shortlisted': 'Pré-selecionado',
    'rejected': 'Candidatura não selecionada',
    'accepted': 'Candidatura aceita'
  };
  return titles[status as keyof typeof titles] || 'Status atualizado';
}

function getStatusDescription(status: string, jobTitle?: string): string {
  const descriptions = {
    'pending': 'Sua candidatura está sendo analisada pela empresa.',
    'reviewed': 'Sua candidatura foi analisada e está em processo de seleção.',
    'shortlisted': 'Parabéns! Você foi pré-selecionado para a próxima etapa.',
    'rejected': 'Infelizmente, sua candidatura não foi selecionada desta vez.',
    'accepted': 'Parabéns! Sua candidatura foi aceita!'
  };
  return descriptions[status as keyof typeof descriptions] || 'Status da candidatura atualizado.';
}

function getStatusType(status: string): string {
  const types = {
    'pending': 'pending',
    'reviewed': 'completed',
    'shortlisted': 'completed',
    'rejected': 'cancelled',
    'accepted': 'completed'
  };
  return types[status as keyof typeof types] || 'pending';
}

function calculateProgress(status: string, interviewCount: number): number {
  const progressMap = {
    'pending': 25,
    'reviewed': 50,
    'shortlisted': 75,
    'rejected': 0,
    'accepted': 100
  };

  let progress = progressMap[status as keyof typeof progressMap] || 25;

  // Ajustar progresso baseado em entrevistas
  if (interviewCount > 0) {
    progress = Math.min(progress + (interviewCount * 10), 90);
  }

  return progress;
}
