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
    const feedback = await request.json();

    // Validar dados do feedback
    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve estar entre 1 e 5' },
        { status: 400 }
      );
    }

    const result = await InterviewService.submitCandidateFeedback(id, user._id, feedback);

    return NextResponse.json({
      message: 'Feedback enviado com sucesso.',
      interview: result.interview
    });

  } catch (error) {
    console.error('Erro ao enviar feedback do candidato:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
