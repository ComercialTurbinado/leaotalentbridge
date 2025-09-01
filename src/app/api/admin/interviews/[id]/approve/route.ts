import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/middleware/auth';
import { InterviewService } from '@/lib/services/InterviewService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAdminAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const { action, comments } = await request.json();

    // Validar ação
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Ação inválida. Use "approve" ou "reject"' },
        { status: 400 }
      );
    }

    const result = await InterviewService.adminApproveInterview(id, user._id, action, comments);

    return NextResponse.json({
      message: `Entrevista ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      interview: result.interview
    });

  } catch (error) {
    console.error('Erro ao aprovar/rejeitar entrevista:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
