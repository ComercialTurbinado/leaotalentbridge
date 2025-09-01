import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/NotificationService';

export async function POST(request: NextRequest) {
  try {
    // Verificar se é uma chamada autorizada (cron job)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await NotificationService.processScheduledNotifications();

    return NextResponse.json({
      success: true,
      message: 'Notificações agendadas processadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar notificações agendadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
