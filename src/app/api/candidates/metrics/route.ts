import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { CandidateMetricsService } from '@/lib/services/CandidateMetricsService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as 'weekly' | 'monthly') || 'monthly';
    const action = searchParams.get('action') || 'current';

    if (action === 'history') {
      const limit = parseInt(searchParams.get('limit') || '12');
      const history = await CandidateMetricsService.getMetricsHistory(user._id, period, limit);
      
      return NextResponse.json({
        history: history.map(metric => ({
          date: metric.date,
          overallScore: metric.overallScore,
          ranking: metric.ranking,
          applications: metric.applications,
          documents: metric.documents,
          interviews: metric.interviews,
          trends: metric.trends
        }))
      });
    }

    // Buscar métricas atuais ou calcular novas
    let metrics = await CandidateMetricsService.getMetrics(user._id, period);
    
    if (!metrics) {
      // Calcular métricas se não existirem
      const calculatedMetrics = await CandidateMetricsService.calculateMetrics(user._id, period);
      return NextResponse.json({ metrics: calculatedMetrics });
    }

    // Converter para formato de resposta
    const responseMetrics = {
      overallScore: metrics.overallScore,
      ranking: metrics.ranking,
      applications: {
        total: metrics.applications.total,
        successRate: metrics.applications.total > 0 ? 
          ((metrics.applications.accepted + metrics.applications.shortlisted) / metrics.applications.total * 100) : 0,
        pending: metrics.applications.pending,
        shortlisted: metrics.applications.shortlisted,
        rejected: metrics.applications.rejected
      },
      profile: {
        completionRate: 0, // Será calculado no frontend
        views: metrics.profileViews.total,
        lastUpdate: metrics.updatedAt
      },
      documents: {
        total: metrics.documents.total,
        verified: metrics.documents.verified,
        completionRate: metrics.documents.completionRate
      },
      interviews: {
        total: metrics.interviews.total,
        successRate: metrics.interviews.successRate,
        upcoming: metrics.interviews.scheduled
      },
      trends: metrics.trends
    };

    return NextResponse.json({ metrics: responseMetrics });

  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { period = 'monthly' } = await request.json();

    // Forçar recálculo das métricas
    const metrics = await CandidateMetricsService.calculateMetrics(user._id, period);

    return NextResponse.json({ metrics });

  } catch (error) {
    console.error('Erro ao calcular métricas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
