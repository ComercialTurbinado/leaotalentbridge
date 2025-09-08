import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { NotificationService } from '@/lib/services/NotificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'candidato') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    const notifications = await NotificationService.getUserNotifications(user._id, {
      limit,
      unreadOnly,
      type
    });

    const unreadCount = await NotificationService.getUnreadCount(user._id);

    return NextResponse.json({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
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

    const { action, notificationId } = await request.json();

    if (action === 'mark_all_read') {
      await NotificationService.markAllAsRead(user._id);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_read' && notificationId) {
      await NotificationService.markAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && notificationId) {
      await NotificationService.deleteNotification(notificationId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
