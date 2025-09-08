import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { InterviewService } from '@/lib/services/InterviewService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { response, comments } = await request.json();

    // Validar resposta
    if (!response || !['accepted', 'rejected'].includes(response)) {
      return NextResponse.json(
        { error: 'Resposta inválida. Use "accepted" ou "rejected"' },
        { status: 400 }
      );
    }

    const result = await InterviewService.candidateRespondToInterview(
      id,
      user._id,
      response,
      comments
    );

    return NextResponse.json({
      message: `Entrevista ${response === 'accepted' ? 'aceita' : 'rejeitada'} com sucesso.`,
      interview: result.interview
    });

  } catch (error) {
    console.error('Erro ao responder entrevista:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
