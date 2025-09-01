import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import Job from '@/lib/models/Job';
import Application from '@/lib/models/Application';
import JobRecommendation from '@/lib/models/JobRecommendation';

// Verificar autenticação
async function verifyAuth(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;

    // TODO: Implementar verificação JWT real
    // Por enquanto, aceitar qualquer token para desenvolvimento
    return { type: 'empresa', _id: 'empresa' };
  } catch (error) {
    return null;
  }
}

// GET - Estatísticas da empresa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    const { id } = await params;
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    // Verificar se a empresa existe
    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Buscar estatísticas em paralelo
    const [jobStats, applicationStats, recommendationStats, recentJobs, recentApplications, recentRecommendations] = await Promise.all([
      // Estatísticas de vagas
      Job.aggregate([
        { $match: { companyId: company._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Estatísticas de candidaturas
      Application.aggregate([
        { $match: { companyId: company._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Estatísticas de indicações
      JobRecommendation.aggregate([
        { $match: { companyId: company._id, isActive: true } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Vagas recentes
      Job.find({ companyId: company._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt applicationsCount'),
      
      // Candidaturas recentes
      Application.find({ companyId: company._id })
        .populate('candidateId', 'name email')
        .populate('jobId', 'title')
        .sort({ appliedAt: -1 })
        .limit(5)
        .select('status appliedAt candidateId jobId'),
      
      // Indicações recentes
      JobRecommendation.find({ companyId: company._id, isActive: true })
        .populate('candidateId', 'name')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('status recommendedAt candidateId jobId matchScore')
    ]);

    // Processar estatísticas de vagas
    const jobStatsMap = jobStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as any);

    // Processar estatísticas de candidaturas
    const applicationStatsMap = applicationStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as any);

    // Processar estatísticas de indicações
    const recommendationStatsMap = recommendationStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as any);

    // Calcular totais
    const totalJobs = (Object.values(jobStatsMap) as number[]).reduce((sum: number, count: number) => sum + count, 0);
    const totalApplications = (Object.values(applicationStatsMap) as number[]).reduce((sum: number, count: number) => sum + count, 0);
    const totalRecommendations = (Object.values(recommendationStatsMap) as number[]).reduce((sum: number, count: number) => sum + count, 0);

    // Calcular métricas de performance
    const activeJobs = jobStatsMap.active || 0;
    const draftJobs = jobStatsMap.draft || 0;
    const closedJobs = jobStatsMap.closed || 0;
    
    const appliedApplications = applicationStatsMap.applied || 0;
    const reviewingApplications = applicationStatsMap.reviewing || 0;
    const interviewedApplications = applicationStatsMap.interviewed || 0;
    const hiredApplications = applicationStatsMap.hired || 0;
    const rejectedApplications = applicationStatsMap.rejected || 0;

    // Estatísticas de indicações
    const pendingRecommendations = recommendationStatsMap.pending || 0;
    const acceptedRecommendations = recommendationStatsMap.accepted || 0;
    const rejectedRecommendations = recommendationStatsMap.rejected || 0;
    const withdrawnRecommendations = recommendationStatsMap.withdrawn || 0;

    // Calcular taxa de conversão
    const conversionRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;
    const interviewRate = totalApplications > 0 ? (interviewedApplications / totalApplications) * 100 : 0;
    const recommendationAcceptanceRate = totalRecommendations > 0 ? (acceptedRecommendations / totalRecommendations) * 100 : 0;

    const stats = {
      jobs: {
        total: totalJobs,
        active: activeJobs,
        draft: draftJobs,
        closed: closedJobs,
        expired: jobStatsMap.expired || 0
      },
      applications: {
        total: totalApplications,
        applied: appliedApplications,
        reviewing: reviewingApplications,
        interviewed: interviewedApplications,
        hired: hiredApplications,
        rejected: rejectedApplications
      },
      recommendations: {
        total: totalRecommendations,
        pending: pendingRecommendations,
        accepted: acceptedRecommendations,
        rejected: rejectedRecommendations,
        withdrawn: withdrawnRecommendations
      },
      performance: {
        conversionRate: Math.round(conversionRate * 100) / 100,
        interviewRate: Math.round(interviewRate * 100) / 100,
        recommendationAcceptanceRate: Math.round(recommendationAcceptanceRate * 100) / 100,
        averageResponseTime: 2.5, // TODO: Implementar cálculo real
        averageProcessTime: 15.2 // TODO: Implementar cálculo real
      },
      recent: {
        jobs: recentJobs.map(job => ({
          id: job._id,
          title: job.title,
          status: job.status,
          applicationsCount: job.applicationsCount || 0,
          createdAt: job.createdAt
        })),
        applications: recentApplications.map(app => ({
          id: app._id,
          candidateName: app.candidateId?.name || 'Nome não informado',
          candidateEmail: app.candidateId?.email || 'E-mail não informado',
          jobTitle: app.jobId?.title || 'Vaga não informada',
          status: app.status,
          appliedAt: app.appliedAt
        })),
        recommendations: recentRecommendations.map(rec => ({
          id: rec._id,
          candidateName: rec.candidateId?.name || 'Candidato não informado',
          jobTitle: rec.jobId?.title || 'Vaga não informada',
          status: rec.status,
          matchScore: rec.matchScore || 0,
          recommendedAt: rec.recommendedAt
        }))
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Estatísticas da empresa carregadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar estatísticas da empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao carregar estatísticas' },
      { status: 500 }
    );
  }
}
