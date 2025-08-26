import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import Job from '@/lib/models/Job';
import Application from '@/lib/models/Application';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação de empresa
async function verifyCompanyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'empresa' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Relatórios da empresa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyUser = await verifyCompanyAuth(request);
    if (!companyUser) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas empresas' },
        { status: 403 }
      );
    }

    const { id: companyId } = await params;
    await connectMongoDB();

    // Verificar se a empresa existe e se o usuário tem acesso
    const company = await Company.findById(companyId);
    if (!company || company.email !== companyUser.email) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada ou acesso negado' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const jobId = searchParams.get('jobId');
    
    // Construir filtro de data
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let reportData: any = {};

    switch (reportType) {
      case 'overview':
        // Relatório Geral da Empresa
        const [
          totalJobs,
          totalApplications,
          activeJobs,
          approvedApplications,
          hiredApplications,
          jobStats,
          applicationStats,
          monthlyTrends
        ] = await Promise.all([
          Job.countDocuments({ companyId }),
          Application.countDocuments({ companyId }),
          Job.countDocuments({ companyId, status: 'active' }),
          Application.countDocuments({ companyId, adminApproved: true }),
          Application.countDocuments({ companyId, status: 'hired' }),
          
          // Estatísticas de vagas por status
          Job.aggregate([
            { $match: { companyId: company._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          
          // Estatísticas de candidaturas por status
          Application.aggregate([
            { $match: { companyId: company._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          
          // Tendências mensais
          Application.aggregate([
            { $match: { companyId: company._id } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$appliedAt" } },
                applications: { $sum: 1 },
                approved: { $sum: { $cond: ['$adminApproved', 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
              }
            },
            { $sort: { _id: 1 } }
          ])
        ]);

        const jobStatsMap = jobStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {});

        const applicationStatsMap = applicationStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {});

        reportData = {
          overview: {
            totalJobs,
            totalApplications,
            activeJobs,
            approvedApplications,
            hiredApplications,
            conversionRate: totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0
          },
          jobStats: jobStatsMap,
          applicationStats: applicationStatsMap,
          monthlyTrends
        };
        break;

      case 'jobs':
        // Relatório de Vagas da Empresa
        const jobFilter = { companyId: company._id, ...dateFilter };
        if (jobId) jobFilter._id = jobId;

        const [
          jobTrends,
          jobByCategory,
          jobByLocation,
          jobByStatus,
          jobPerformance,
          topJobs
        ] = await Promise.all([
          // Tendências de vagas por dia
          Job.aggregate([
            { $match: jobFilter },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]),
          
          // Vagas por categoria
          Job.aggregate([
            { $match: jobFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          
          // Vagas por localização
          Job.aggregate([
            { $match: jobFilter },
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          
          // Vagas por status
          Job.aggregate([
            { $match: jobFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          
          // Performance das vagas
          Job.aggregate([
            { $match: jobFilter },
            {
              $lookup: {
                from: 'applications',
                localField: '_id',
                foreignField: 'jobId',
                as: 'applications'
              }
            },
            {
              $project: {
                title: 1,
                category: 1,
                location: 1,
                status: 1,
                applicationsCount: { $size: '$applications' },
                approvedApplications: {
                  $size: {
                    $filter: {
                      input: '$applications',
                      cond: '$$this.adminApproved'
                    }
                  }
                },
                hiredApplications: {
                  $size: {
                    $filter: {
                      input: '$applications',
                      cond: { $eq: ['$$this.status', 'hired'] }
                    }
                  }
                }
              }
            },
            { $sort: { applicationsCount: -1 } }
          ]),
          
          // Top vagas
          Job.aggregate([
            { $match: jobFilter },
            {
              $lookup: {
                from: 'applications',
                localField: '_id',
                foreignField: 'jobId',
                as: 'applications'
              }
            },
            {
              $project: {
                title: 1,
                category: 1,
                applicationsCount: { $size: '$applications' },
                approvedApplications: {
                  $size: {
                    $filter: {
                      input: '$applications',
                      cond: '$$this.adminApproved'
                    }
                  }
                }
              }
            },
            { $sort: { applicationsCount: -1 } },
            { $limit: 10 }
          ])
        ]);

        reportData = {
          trends: jobTrends,
          byCategory: jobByCategory,
          byLocation: jobByLocation,
          byStatus: jobByStatus,
          performance: jobPerformance,
          topJobs
        };
        break;

      case 'applications':
        // Relatório de Candidaturas da Empresa
        const applicationFilter = { companyId: company._id, ...dateFilter };
        if (jobId) applicationFilter.jobId = jobId;

        const [
          applicationTrends,
          applicationByJob,
          applicationByStatus,
          applicationByMonth,
          candidateQuality,
          responseTime
        ] = await Promise.all([
          // Tendências de candidaturas por dia
          Application.aggregate([
            { $match: applicationFilter },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$appliedAt" } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]),
          
          // Candidaturas por vaga
          Application.aggregate([
            { $match: applicationFilter },
            {
              $lookup: {
                from: 'jobs',
                localField: 'jobId',
                foreignField: '_id',
                as: 'job'
              }
            },
            { $unwind: '$job' },
            {
              $group: {
                _id: '$job.title',
                count: { $sum: 1 },
                approved: { $sum: { $cond: ['$adminApproved', 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
              }
            },
            { $sort: { count: -1 } }
          ]),
          
          // Candidaturas por status
          Application.aggregate([
            { $match: applicationFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          
          // Candidaturas por mês
          Application.aggregate([
            { $match: applicationFilter },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$appliedAt" } },
                count: { $sum: 1 },
                approved: { $sum: { $cond: ['$adminApproved', 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
              }
            },
            { $sort: { _id: 1 } }
          ]),
          
          // Qualidade dos candidatos
          Application.aggregate([
            { $match: applicationFilter },
            {
              $lookup: {
                from: 'users',
                localField: 'candidateId',
                foreignField: '_id',
                as: 'candidate'
              }
            },
            { $unwind: '$candidate' },
            {
              $group: {
                _id: null,
                avgScreeningScore: { $avg: '$screening.score' },
                highQualityCandidates: {
                  $sum: { $cond: [{ $gte: ['$screening.score', 80] }, 1, 0] }
                },
                totalCandidates: { $sum: 1 }
              }
            }
          ]),
          
          // Tempo de resposta
          Application.aggregate([
            { $match: applicationFilter },
            {
              $project: {
                appliedAt: 1,
                lastContactDate: 1,
                responseTime: {
                  $cond: [
                    '$lastContactDate',
                    {
                      $divide: [
                        { $subtract: ['$lastContactDate', '$appliedAt'] },
                        1000 * 60 * 60 * 24 // dias
                      ]
                    },
                    null
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                avgResponseTime: { $avg: '$responseTime' },
                minResponseTime: { $min: '$responseTime' },
                maxResponseTime: { $max: '$responseTime' }
              }
            }
          ])
        ]);

        const qualityData = candidateQuality[0] || { avgScreeningScore: 0, highQualityCandidates: 0, totalCandidates: 0 };
        const responseData = responseTime[0] || { avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0 };

        reportData = {
          trends: applicationTrends,
          byJob: applicationByJob,
          byStatus: applicationByStatus,
          byMonth: applicationByMonth,
          quality: {
            avgScreeningScore: Math.round(qualityData.avgScreeningScore || 0),
            highQualityRate: qualityData.totalCandidates > 0 ? 
              (qualityData.highQualityCandidates / qualityData.totalCandidates) * 100 : 0
          },
          responseTime: {
            avg: Math.round(responseData.avgResponseTime || 0),
            min: Math.round(responseData.minResponseTime || 0),
            max: Math.round(responseData.maxResponseTime || 0)
          }
        };
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Tipo de relatório inválido' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      company: {
        name: company.name,
        industry: company.industry,
        size: company.size
      },
      filters: {
        startDate,
        endDate,
        jobId
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório da empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
