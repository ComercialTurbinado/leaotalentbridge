import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query: any = { userId: user._id };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (unreadOnly) {
      query.read = false;
    }

    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);
    const unreadCount = await Notification.countDocuments({ 
      userId: user._id, 
      read: false 
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages
      },
      unreadCount
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const data = await request.json();
    const { 
      targetUserId, 
      type, 
      title, 
      message, 
      data: notificationData, 
      priority = 'medium',
      expiresAt 
    } = data;

    // Verificar se o usuário tem permissão para criar notificações
    if (user.type !== 'admin' && user._id.toString() !== targetUserId) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Verificar se o usuário alvo existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Usuário alvo não encontrado' },
        { status: 404 }
      );
    }

    // Criar notificação
    const notification = new Notification({
      userId: targetUserId,
      type,
      title,
      message,
      data: notificationData || {},
      priority,
      status: 'active',
      read: false,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: user._id
    });

    await notification.save();

    // Enviar push notification se configurado
    try {
      await sendPushNotification(targetUser, notification);
    } catch (pushError) {
      console.warn('Erro ao enviar push notification:', pushError);
      // Não falhar a operação principal por erro de push
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notificação criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}

// PUT - Marcar notificação como lida
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const data = await request.json();
    const { notificationId, action } = data;

    if (action === 'mark_read') {
      // Marcar como lida
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: user._id },
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return NextResponse.json(
          { success: false, message: 'Notificação não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: notification,
        message: 'Notificação marcada como lida'
      });
    } else if (action === 'mark_all_read') {
      // Marcar todas como lidas
      const result = await Notification.updateMany(
        { userId: user._id, read: false },
        { read: true, readAt: new Date() }
      );

      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} notificações marcadas como lidas`
      });
    }

    return NextResponse.json(
      { success: false, message: 'Ação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar notificação' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar notificação
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (notificationId) {
      // Deletar notificação específica
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId: user._id
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, message: 'Notificação não encontrada' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notificação deletada com sucesso'
      });
    } else {
      // Deletar todas as notificações lidas do usuário
      const result = await Notification.deleteMany({
        userId: user._id,
        read: true
      });

      return NextResponse.json({
        success: true,
        message: `${result.deletedCount} notificações deletadas`
      });
    }

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar notificação' },
      { status: 500 }
    );
  }
}

// Função para enviar push notifications
async function sendPushNotification(user: any, notification: any) {
  try {
    // Verificar se o usuário tem push tokens configurados
    if (!user.pushTokens || user.pushTokens.length === 0) {
      return;
    }

    // Aqui você pode integrar com serviços como:
    // - Firebase Cloud Messaging (FCM)
    // - OneSignal
    // - Pushwoosh
    // - Expo Push Notifications
    
    // Exemplo básico de estrutura para FCM:
    const pushData = {
      to: user.pushTokens,
      notification: {
        title: notification.title,
        body: notification.message,
        icon: '/images/notification-icon.png',
        badge: '1',
        tag: notification.type
      },
      data: {
        notificationId: notification._id.toString(),
        type: notification.type,
        ...notification.data
      },
      priority: notification.priority === 'high' ? 'high' : 'normal'
    };

    // Enviar para FCM ou outro serviço
    // await sendToFCM(pushData);
    
    console.log('Push notification preparada:', pushData);

  } catch (error) {
    console.error('Erro ao enviar push notification:', error);
    throw error;
  }
}
