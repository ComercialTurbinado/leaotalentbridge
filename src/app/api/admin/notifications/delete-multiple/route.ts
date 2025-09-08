import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../../lib/mongodb';
import Notification from '../../../../../lib/models/Notification';
import User from '../../../../../lib/models/User';
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

// DELETE - Deletar múltiplas notificações
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação de admin
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta API.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs das notificações são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Deletar múltiplas notificações
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds }
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Nenhuma notificação encontrada com os IDs fornecidos' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} notificação(ões) deletada(s) com sucesso`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Erro ao deletar múltiplas notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao deletar notificações' },
      { status: 500 }
    );
  }
}
