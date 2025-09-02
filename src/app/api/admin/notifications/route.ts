import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '../../../../lib/mongodb';
import Notification from '../../../../lib/models/Notification';
import User from '../../../../lib/models/User';
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

// GET - Listar todas as notificações
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação de admin
    const adminUser = await verifyAdminAuth(request);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar esta API.' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    // Parâmetros de paginação e filtros
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const read = searchParams.get('read');
    const userId = searchParams.get('userId');

    // Construir filtros
    const filters: any = {};
    
    if (type) filters.type = type;
    if (priority) filters.priority = priority;
    if (read !== null) filters.read = read === 'true';
    if (userId) filters.userId = userId;

    // Calcular skip para paginação
    const skip = (page - 1) * limit;

    // Buscar notificações com paginação
    const notifications = await Notification.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email type')
      .lean();

    // Contar total de notificações
    const total = await Notification.countDocuments(filters);

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar notificações' },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação (apenas para admins)
export async function POST(request: NextRequest) {
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
    const { userId, type, title, message, priority = 'medium', data } = body;

    // Validações
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: userId, type, title, message' },
        { status: 400 }
      );
    }

    // Validar prioridade
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: 'Prioridade inválida. Use: low, medium, high, urgent' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Criar notificação
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      priority,
      data,
      read: false,
      createdAt: new Date()
    });

    await notification.save();

    // Populate para retornar dados completos
    await notification.populate('userId', 'name email type');

    return NextResponse.json({
      success: true,
      message: 'Notificação criada com sucesso',
      notification
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar notificação' },
      { status: 500 }
    );
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

    // Deletar notificações
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds }
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} notificação(ões) deletada(s) com sucesso`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Erro ao deletar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao deletar notificações' },
      { status: 500 }
    );
  }
}
