import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { InterviewService } from '@/lib/services/InterviewService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'empresa') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const adminStatus = searchParams.get('adminStatus') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await InterviewService.getInterviews({
      companyId: user._id.toString(),
      status,
      adminStatus,
      limit,
      offset
    });

    return NextResponse.json({
      interviews: result.interviews,
      total: result.total,
      hasMore: result.total > offset + limit
    });

  } catch (error) {
    console.error('Erro ao buscar entrevistas da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'empresa') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.candidateId || !data.title || !data.scheduledDate || !data.type) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Validar se a empresa tem acesso ao candidato (através de candidatura)
    if (data.applicationId) {
      const Application = (await import('@/lib/models/Application')).default;
      const application = await Application.findOne({
        _id: data.applicationId,
        companyId: user._id
      });

      if (!application) {
        return NextResponse.json(
          { error: 'Candidatura não encontrada ou não pertence à sua empresa' },
          { status: 403 }
        );
      }
    }

    const interviewData = {
      ...data,
      companyId: user._id.toString(),
      createdBy: user._id
    };

    const result = await InterviewService.createInterview(interviewData);

    return NextResponse.json({
      message: 'Entrevista solicitada com sucesso. Aguardando aprovação do administrador.',
      interview: result.interview
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar entrevista:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
