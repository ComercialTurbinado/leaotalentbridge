import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { InterviewService } from '@/lib/services/InterviewService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await InterviewService.getInterviews({
      candidateId: user._id,
      status,
      limit,
      offset
    });

    return NextResponse.json({
      interviews: result.interviews,
      total: result.total,
      hasMore: result.total > offset + limit
    });

  } catch (error) {
    console.error('Erro ao buscar entrevistas do candidato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
