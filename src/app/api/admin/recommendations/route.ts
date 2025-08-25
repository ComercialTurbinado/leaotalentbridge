import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import JobRecommendation from '@/lib/models/JobRecommendation';
import Job from '@/lib/models/Job';
import User from '@/lib/models/User';
import Company from '@/lib/models/Company';
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

// GET - Listar indicações
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');
    const companyId = searchParams.get('companyId');
    const search = searchParams.get('search');

    await connectMongoDB();

    // Construir filtros
    const filters: any = { isActive: true };
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    if (jobId) {
      filters.jobId = jobId;
    }
    
    if (candidateId) {
      filters.candidateId = candidateId;
    }
    
    if (companyId) {
      filters.companyId = companyId;
    }

    // Busca por texto (nome do candidato ou título da vaga)
    if (search) {
      const candidateIds = await User.find({
        type: 'candidate',
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const jobIds = await Job.find({
        title: { $regex: search, $options: 'i' }
      }).select('_id');
      
      filters.$or = [
        { candidateId: { $in: candidateIds.map(u => u._id) } },
        { jobId: { $in: jobIds.map(j => j._id) } }
      ];
    }

    // Calcular paginação
    const skip = (page - 1) * limit;
    const total = await JobRecommendation.countDocuments(filters);
    const pages = Math.ceil(total / limit);

    // Buscar indicações com dados populados
    const recommendations = await JobRecommendation.find(filters)
      .populate('jobId', 'title category location workType salary status')
      .populate('candidateId', 'name email profile')
      .populate('companyId', 'name industry logo')
      .populate('recommendedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Processar dados para resposta
    const processedRecommendations = recommendations.map(rec => ({
      id: rec._id,
      job: {
        id: rec.jobId._id,
        title: rec.jobId.title,
        category: rec.jobId.category,
        location: rec.jobId.location,
        workType: rec.jobId.workType,
        salary: rec.jobId.salary,
        status: rec.jobId.status
      },
      candidate: {
        id: rec.candidateId._id,
        name: rec.candidateId.name,
        email: rec.candidateId.email,
        profile: rec.candidateId.profile
      },
      company: {
        id: rec.companyId._id,
        name: rec.companyId.name,
        industry: rec.companyId.industry,
        logo: rec.companyId.logo
      },
      recommendedBy: {
        id: rec.recommendedBy._id,
        name: rec.recommendedBy.name,
        email: rec.recommendedBy.email
      },
      status: rec.status,
      recommendedAt: rec.recommendedAt,
      respondedAt: rec.respondedAt,
      adminNotes: rec.adminNotes,
      candidateNotes: rec.candidateNotes,
      companyNotes: rec.companyNotes,
      matchScore: rec.matchScore,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: processedRecommendations,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });

  } catch (error) {
    console.error('Erro ao listar indicações:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar indicações' },
      { status: 500 }
    );
  }
}

// POST - Criar nova indicação
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas administradores' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { jobId, candidateId, adminNotes, matchScore } = data;

    await connectMongoDB();

    // Validar se a vaga existe
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Validar se o candidato existe
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.type !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Candidato não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma indicação para este candidato nesta vaga
    const existingRecommendation = await JobRecommendation.findOne({
      jobId,
      candidateId,
      isActive: true
    });

    if (existingRecommendation) {
      return NextResponse.json(
        { success: false, message: 'Candidato já foi indicado para esta vaga' },
        { status: 400 }
      );
    }

    // Criar nova indicação
    const recommendation = new JobRecommendation({
      jobId,
      candidateId,
      companyId: job.companyId,
      recommendedBy: admin._id,
      adminNotes,
      matchScore,
      status: 'pending'
    });

    await recommendation.save();

    // Buscar dados populados para resposta
    const populatedRecommendation = await JobRecommendation.findById(recommendation._id)
      .populate('jobId', 'title category location workType salary status')
      .populate('candidateId', 'name email profile')
      .populate('companyId', 'name industry logo')
      .populate('recommendedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: {
        id: populatedRecommendation._id,
        job: {
          id: populatedRecommendation.jobId._id,
          title: populatedRecommendation.jobId.title,
          category: populatedRecommendation.jobId.category,
          location: populatedRecommendation.jobId.location,
          workType: populatedRecommendation.jobId.workType,
          salary: populatedRecommendation.jobId.salary,
          status: populatedRecommendation.jobId.status
        },
        candidate: {
          id: populatedRecommendation.candidateId._id,
          name: populatedRecommendation.candidateId.name,
          email: populatedRecommendation.candidateId.email,
          profile: populatedRecommendation.candidateId.profile
        },
        company: {
          id: populatedRecommendation.companyId._id,
          name: populatedRecommendation.companyId.name,
          industry: populatedRecommendation.companyId.industry,
          logo: populatedRecommendation.companyId.logo
        },
        recommendedBy: {
          id: populatedRecommendation.recommendedBy._id,
          name: populatedRecommendation.recommendedBy.name,
          email: populatedRecommendation.recommendedBy.email
        },
        status: populatedRecommendation.status,
        recommendedAt: populatedRecommendation.recommendedAt,
        adminNotes: populatedRecommendation.adminNotes,
        matchScore: populatedRecommendation.matchScore,
        createdAt: populatedRecommendation.createdAt
      },
      message: 'Indicação criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar indicação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar indicação' },
      { status: 500 }
    );
  }
}
