import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { DashboardAlertService } from '@/lib/services/DashboardAlertService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Dashboard Summary - Iniciando verificação de auth...');
    
    const user = await verifyAuth(request);
    console.log('🔍 [DEBUG] Usuário verificado:', user ? `${user.name} (${user.type})` : 'null');
    
    if (!user) {
      console.log('❌ [DEBUG] Usuário não autenticado - retornando 401');
      return NextResponse.json({ error: 'Não autorizado - usuário não autenticado' }, { status: 401 });
    }
    
    if (user.type !== 'candidato') {
      console.log('❌ [DEBUG] Usuário não é candidato:', user.type);
      return NextResponse.json({ error: 'Não autorizado - apenas candidatos' }, { status: 401 });
    }
    
    if (user.status !== 'approved') {
      console.log('❌ [DEBUG] Usuário não está aprovado:', user.status);
      return NextResponse.json({ 
        error: 'Conta pendente de aprovação', 
        status: user.status,
        requiresApproval: true 
      }, { status: 403 });
    }

    console.log('✅ [DEBUG] Usuário autenticado e autorizado, buscando dados...');
    const summary = await DashboardAlertService.getDashboardSummary(user._id);
    console.log('✅ [DEBUG] Dados do dashboard carregados com sucesso');

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('❌ [DEBUG] Erro ao buscar resumo do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
