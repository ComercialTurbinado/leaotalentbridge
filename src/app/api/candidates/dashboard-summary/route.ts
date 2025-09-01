import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { DashboardAlertService } from '@/lib/services/DashboardAlertService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const summary = await DashboardAlertService.getDashboardSummary(user._id);

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
