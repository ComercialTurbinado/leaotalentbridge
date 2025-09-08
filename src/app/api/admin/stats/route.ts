import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';
import Job from '@/lib/models/Job';
import Application from '@/lib/models/Application';
import Course from '@/lib/models/Course';
import Simulation from '@/lib/models/Simulation';
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

// GET - Estatísticas administrativas
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminAuth(request);
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    // Buscar estatísticas em paralelo para melhor performance
    const [
      userStats,
      companyStats,
      jobStats,
      applicationStats,
      courseStats,
      simulationStats
    ] = await Promise.all([
      // Estatísticas de usuários
      User.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'pending'] },
                  1,
                  0
                ]
              }
            },
            approved: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'approved'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      
      // Estatísticas de empresas
      Company.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'pending'] },
                  1,
                  0
                ]
              }
            },
            active: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'active'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      
      // Estatísticas de vagas
      Job.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Estatísticas de candidaturas
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Estatísticas de cursos
      Course.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  { $eq: ['$isActive', true] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      
      // Estatísticas de simulações
      Simulation.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  { $eq: ['$isActive', true] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    // Processar estatísticas de usuários
    const userStatsMap = userStats.reduce((acc, stat) => {
      acc[stat._id] = {
        total: stat.count,
        pending: stat.pending,
        approved: stat.approved
      };
      return acc;
    }, {} as any);

    // Processar estatísticas de vagas
    const jobStatsMap = jobStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as any);

    // Processar estatísticas de candidaturas
    const applicationStatsMap = applicationStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as any);

    // Calcular totais
    const totalUsers = Object.values(userStatsMap).reduce((sum: any, stat: any) => sum + stat.total, 0);
    const totalCompanies = companyStats[0]?.total || 0;
    const totalJobs = Object.values(jobStatsMap).reduce((sum: any, count: any) => sum + count, 0);
    const totalApplications = Object.values(applicationStatsMap).reduce((sum: any, count: any) => sum + count, 0);
    const totalCourses = courseStats[0]?.total || 0;
    const totalSimulations = simulationStats[0]?.total || 0;

    // Calcular crescimento mensal (simulado por enquanto)
    const monthlyGrowth = 12.5; // TODO: Implementar cálculo real baseado em dados históricos

    const stats = {
      users: {
        total: totalUsers,
        candidates: userStatsMap.candidato?.total || 0,
        companies: userStatsMap.empresa?.total || 0,
        admins: userStatsMap.admin?.total || 0,
        pending: (userStatsMap.candidato?.pending || 0) + (userStatsMap.empresa?.pending || 0)
      },
      companies: {
        total: totalCompanies,
        pending: companyStats[0]?.pending || 0,
        active: companyStats[0]?.active || 0
      },
      jobs: {
        total: totalJobs,
        active: jobStatsMap.active || 0,
        draft: jobStatsMap.draft || 0,
        closed: jobStatsMap.closed || 0,
        expired: jobStatsMap.expired || 0
      },
      applications: {
        total: totalApplications,
        applied: applicationStatsMap.applied || 0,
        reviewing: applicationStatsMap.reviewing || 0,
        interviewed: applicationStatsMap.interviewed || 0,
        hired: applicationStatsMap.hired || 0,
        rejected: applicationStatsMap.rejected || 0
      },
      courses: {
        total: totalCourses,
        active: courseStats[0]?.active || 0
      },
      simulations: {
        total: totalSimulations,
        active: simulationStats[0]?.active || 0
      },
      platform: {
        monthlyGrowth,
        activeProcesses: applicationStatsMap.reviewing || 0,
        totalRevenue: 0 // TODO: Implementar quando tivermos sistema de pagamentos
      }
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Estatísticas carregadas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao carregar estatísticas' },
      { status: 500 }
    );
  }
}
