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

// GET - Estatísticas das notificações
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

    // Parâmetros de filtro por período
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Pipeline de agregação para estatísticas
    const statsPipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          urgent: {
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
          },
          byType: {
            $push: '$type'
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ];

    // Pipeline para estatísticas por tipo
    const typeStatsPipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    // Pipeline para estatísticas por prioridade
    const priorityStatsPipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    // Pipeline para estatísticas por usuário
    const userStatsPipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          userType: '$user.type',
          count: 1,
          unread: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ];

    // Pipeline para estatísticas por dia (últimos 7 dias)
    const dailyStatsPipeline: any[] = [
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          unread: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    // Executar todas as agregações
    const [
      generalStats,
      typeStats,
      priorityStats,
      userStats,
      dailyStats
    ] = await Promise.all([
      Notification.aggregate(statsPipeline),
      Notification.aggregate(typeStatsPipeline),
      Notification.aggregate(priorityStatsPipeline),
      Notification.aggregate(userStatsPipeline),
      Notification.aggregate(dailyStatsPipeline)
    ]);

    // Processar estatísticas gerais
    const stats = generalStats[0] || {
      total: 0,
      unread: 0,
      highPriority: 0,
      urgent: 0
    };

    // Processar estatísticas por tipo
    const byType: { [key: string]: number } = {};
    typeStats.forEach((item: any) => {
      byType[item._id] = item.count;
    });

    // Processar estatísticas por prioridade
    const byPriority: { [key: string]: number } = {};
    priorityStats.forEach((item: any) => {
      byPriority[item._id] = item.count;
    });

    // Processar estatísticas por usuário
    const topUsers = userStats.map((item: any) => ({
      userId: item.userId,
      userName: item.userName,
      userEmail: item.userEmail,
      userType: item.userType,
      count: item.count,
      unread: item.unread
    }));

    // Processar estatísticas diárias
    const dailyData = dailyStats.map((item: any) => ({
      date: item._id,
      count: item.count,
      unread: item.unread
    }));

    // Estatísticas adicionais
    const additionalStats = {
      // Notificações por período
      period: parseInt(period),
      startDate: startDate.toISOString(),
      
      // Médias
      averagePerDay: stats.total / parseInt(period),
      readRate: stats.total > 0 ? ((stats.total - stats.unread) / stats.total) * 100 : 0,
      
      // Distribuição por prioridade
      priorityDistribution: {
        low: byPriority.low || 0,
        medium: byPriority.medium || 0,
        high: byPriority.high || 0,
        urgent: byPriority.urgent || 0
      },
      
      // Top tipos de notificação
      topTypes: Object.entries(byType)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    };

    return NextResponse.json({
      success: true,
      stats: {
        total: stats.total,
        unread: stats.unread,
        highPriority: stats.highPriority,
        urgent: stats.urgent,
        byType,
        byPriority,
        topUsers,
        dailyData,
        additionalStats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
