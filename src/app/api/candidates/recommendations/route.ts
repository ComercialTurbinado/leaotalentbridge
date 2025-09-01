import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { JobRecommendationService } from '@/lib/services/JobRecommendationService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const generateNew = searchParams.get('generate') === 'true';

    let recommendations;

    if (generateNew) {
      // Gerar novas recomendações
      recommendations = await JobRecommendationService.generateRecommendations(user._id);
    } else {
      // Buscar recomendações existentes
      recommendations = await JobRecommendationService.getRecommendations(user._id, limit);
    }

    // Remover informações sensíveis da empresa
    const sanitizedRecommendations = recommendations.map(rec => ({
      ...rec,
      job: {
        ...rec.job,
        company: {
          name: 'Empresa Confidencial',
          size: 'Não informado',
          industry: 'Não informado',
          location: rec.job.location || 'Não informado'
        }
      }
    }));

    return NextResponse.json({
      recommendations: sanitizedRecommendations,
      count: sanitizedRecommendations.length
    });

  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { action, recommendationId } = await request.json();

    if (!recommendationId) {
      return NextResponse.json({ error: 'ID da recomendação é obrigatório' }, { status: 400 });
    }

    switch (action) {
      case 'view':
        await JobRecommendationService.markAsViewed(recommendationId);
        break;
      case 'apply':
        await JobRecommendationService.markAsApplied(recommendationId);
        break;
      case 'dismiss':
        await JobRecommendationService.dismissRecommendation(recommendationId);
        break;
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao atualizar recomendação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}