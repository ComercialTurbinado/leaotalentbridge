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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'admin' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Relatórios administrativos
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const companyId = searchParams.get('companyId');
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
        // Relatório Geral
        const [
          totalUsers,
          totalCompanies,
          totalJobs,
          totalApplications,
          totalCourses,
          totalSimulations,
          userStats,
          applicationStats,
          jobStats,
          companyStats
        ] = await Promise.all([
          User.countDocuments(),
          Company.countDocuments(),
          Job.countDocuments(),
          Application.countDocuments(),
          Course.countDocuments(),
          Simulation.countDocuments(),
          
          // Estatísticas de usuários por tipo
          User.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ]),
          
          // Estatísticas de candidaturas por status
          Application.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          
          // Estatísticas de vagas por status
          Job.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          
          // Estatísticas de empresas por indústria
          Company.aggregate([
            { $group: { _id: '$industry', count: { $sum: 1 } } }
          ])
        ]);

        reportData = {
          overview: {
            totalUsers,
            totalCompanies,
            totalJobs,
            totalApplications,
            totalCourses,
            totalSimulations
          },
          userStats: userStats.reduce((acc: any, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          applicationStats: applicationStats.reduce((acc: any, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          jobStats: jobStats.reduce((acc: any, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          companyStats: companyStats.reduce((acc: any, stat: any) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        };
        break;

      case 'applications':
        // Relatório de Candidaturas
        const applicationFilter = { ...dateFilter };
        if (companyId) applicationFilter.companyId = companyId;
        if (jobId) applicationFilter.jobId = jobId;

        const [
          applicationTrends,
          applicationByCompany,
          applicationByJob,
          applicationByStatus,
          applicationByMonth,
          topCandidates,
          conversionRates
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
          
          // Candidaturas por empresa
          Application.aggregate([
            { $match: applicationFilter },
            {
              $lookup: {
                from: 'companies',
                localField: 'companyId',
                foreignField: '_id',
                as: 'company'
              }
            },
            { $unwind: '$company' },
            {
              $group: {
                _id: '$company.name',
                count: { $sum: 1 },
                approved: { $sum: { $cond: ['$adminApproved', 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
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
            { $sort: { count: -1 } },
            { $limit: 10 }
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
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]),
          
          // Top candidatos
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
                _id: '$candidate.name',
                applications: { $sum: 1 },
                approved: { $sum: { $cond: ['$adminApproved', 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
              }
            },
            { $sort: { applications: -1 } },
            { $limit: 10 }
          ]),
          
          // Taxas de conversão
          Application.aggregate([
            { $match: applicationFilter },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                approved: { $sum: { $cond: ['$adminApproved', 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
                interviewed: { $sum: { $cond: [{ $eq: ['$status', 'interviewed'] }, 1, 0] } }
              }
            }
          ])
        ]);

        const conversionData = conversionRates[0] || { total: 0, approved: 0, hired: 0, interviewed: 0 };
        
        reportData = {
          trends: applicationTrends,
          byCompany: applicationByCompany,
          byJob: applicationByJob,
          byStatus: applicationByStatus,
          byMonth: applicationByMonth,
          topCandidates,
          conversionRates: {
            approvalRate: conversionData.total > 0 ? (conversionData.approved / conversionData.total) * 100 : 0,
            interviewRate: conversionData.total > 0 ? (conversionData.interviewed / conversionData.total) * 100 : 0,
            hireRate: conversionData.total > 0 ? (conversionData.hired / conversionData.total) * 100 : 0,
            total: conversionData.total
          }
        };
        break;

      case 'jobs':
        // Relatório de Vagas
        const jobFilter = { ...dateFilter };
        if (companyId) jobFilter.companyId = companyId;

        const [
          jobTrends,
          jobByCompany,
          jobByCategory,
          jobByLocation,
          jobByStatus,
          jobPerformance
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
          
          // Vagas por empresa
          Job.aggregate([
            { $match: jobFilter },
            {
              $lookup: {
                from: 'companies',
                localField: 'companyId',
                foreignField: '_id',
                as: 'company'
              }
            },
            { $unwind: '$company' },
            {
              $group: {
                _id: '$company.name',
                count: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                applications: { $sum: '$applicationsCount' }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
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
            { $sort: { count: -1 } },
            { $limit: 10 }
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
            { $sort: { applicationsCount: -1 } },
            { $limit: 10 }
          ])
        ]);

        reportData = {
          trends: jobTrends,
          byCompany: jobByCompany,
          byCategory: jobByCategory,
          byLocation: jobByLocation,
          byStatus: jobByStatus,
          performance: jobPerformance
        };
        break;

      case 'companies':
        // Relatório de Empresas
        const companyFilter = { ...dateFilter };
        
        const [
          companyTrends,
          companyByIndustry,
          companyBySize,
          companyPerformance,
          topCompanies
        ] = await Promise.all([
          // Tendências de empresas por dia
          Company.aggregate([
            { $match: companyFilter },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]),
          
          // Empresas por indústria
          Company.aggregate([
            { $match: companyFilter },
            { $group: { _id: '$industry', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          
          // Empresas por tamanho
          Company.aggregate([
            { $match: companyFilter },
            { $group: { _id: '$size', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          
          // Performance das empresas
          Company.aggregate([
            { $match: companyFilter },
            {
              $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: 'companyId',
                as: 'jobs'
              }
            },
            {
              $lookup: {
                from: 'applications',
                localField: '_id',
                foreignField: 'companyId',
                as: 'applications'
              }
            },
            {
              $project: {
                name: 1,
                industry: 1,
                jobsCount: { $size: '$jobs' },
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
          
          // Top empresas
          Company.aggregate([
            { $match: companyFilter },
            {
              $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: 'companyId',
                as: 'jobs'
              }
            },
            {
              $lookup: {
                from: 'applications',
                localField: '_id',
                foreignField: 'companyId',
                as: 'applications'
              }
            },
            {
              $project: {
                name: 1,
                industry: 1,
                jobsCount: { $size: '$jobs' },
                applicationsCount: { $size: '$applications' },
                activeJobs: {
                  $size: {
                    $filter: {
                      input: '$jobs',
                      cond: { $eq: ['$$this.status', 'active'] }
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
          trends: companyTrends,
          byIndustry: companyByIndustry,
          bySize: companyBySize,
          performance: companyPerformance,
          topCompanies
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
      filters: {
        startDate,
        endDate,
        companyId,
        jobId
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
