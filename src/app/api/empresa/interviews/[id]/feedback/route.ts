import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { InterviewService } from '@/lib/services/InterviewService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'empresa') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const feedback = await request.json();

    // Validar dados do feedback
    if (!feedback.technical || !feedback.communication || !feedback.experience || !feedback.overall) {
      return NextResponse.json(
        { error: 'Todos os campos de avaliação são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se as notas estão no range correto
    const scores = [feedback.technical, feedback.communication, feedback.experience, feedback.overall];
    if (scores.some(score => score < 1 || score > 5)) {
      return NextResponse.json(
        { error: 'As notas devem estar entre 1 e 5' },
        { status: 400 }
      );
    }

    const result = await InterviewService.submitCompanyFeedback(id, user._id, feedback);

    return NextResponse.json({
      message: 'Feedback enviado com sucesso. Aguardando aprovação do administrador.',
      interview: result.interview
    });

  } catch (error) {
    console.error('Erro ao enviar feedback:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
