import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../../../lib/mongodb';
import Notification from '../../../../../../lib/models/Notification';
import User from '../../../../../../lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    
    // Verificar JWT
    const decoded = jwt.verify(token, jwtSecret) as any;
    if (!decoded || !decoded.userId || !decoded.type) return null;
    
    // Conectar ao MongoDB e verificar se o usuário é realmente admin
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    
    if (!user || user.type !== 'admin') return null;
    
    return user;
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return null;
  }
}

// PUT - Marcar notificação como lida
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação de admin
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta API.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Buscar e atualizar a notificação
    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        read: true,
        readAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email type');

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida com sucesso',
      notification
    });

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao marcar notificação como lida' },
      { status: 500 }
    );
  }
}
