import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import { NotificationService } from '@/lib/services/NotificationService';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type') || undefined;

    const notifications = await NotificationService.getUserNotifications(
      user._id.toString(),
      { limit, unreadOnly, type }
    );

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, data, priority, sendEmail, sendPush } = body;

    const notification = await NotificationService.createNotification({
      userId: user._id.toString(),
      type,
      title,
      message,
      data,
      priority,
      sendEmail,
      sendPush
    });

    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
