import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import JobRecommendation from '@/lib/models/JobRecommendation';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Verificar autenticação de candidato
async function verifyCandidateAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'candidate' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar indicações do candidato (sem dados da empresa)
export async function GET(request: NextRequest) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas candidatos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    await connectMongoDB();

    // Construir filtros
    const filters: any = { 
      candidateId: candidate._id,
      isActive: true 
    };
    
    if (status && status !== 'all') {
      filters.status = status;
    }

    // Calcular paginação
    const skip = (page - 1) * limit;
    const total = await JobRecommendation.countDocuments(filters);
    const pages = Math.ceil(total / limit);

    // Buscar indicações com dados da vaga (sem dados da empresa)
    const recommendations = await JobRecommendation.find(filters)
      .populate('jobId', 'title description summary category location workType workSchedule salary requirements tags status publishedAt expiresAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Processar dados para resposta (anonimizando dados da empresa)
    const processedRecommendations = recommendations.map(rec => ({
      id: rec._id,
      job: {
        id: rec.jobId._id,
        title: rec.jobId.title,
        description: rec.jobId.description,
        summary: rec.jobId.summary,
        category: rec.jobId.category,
        location: rec.jobId.location,
        workType: rec.jobId.workType,
        workSchedule: rec.jobId.workSchedule,
        salary: rec.jobId.salary,
        requirements: rec.jobId.requirements,
        tags: rec.jobId.tags,
        status: rec.jobId.status,
        publishedAt: rec.jobId.publishedAt,
        expiresAt: rec.jobId.expiresAt
      },
      // Dados anonimizados da empresa
      company: {
        name: 'Empresa Confidencial',
        industry: 'Indústria Confidencial',
        logo: null
      },
      status: rec.status,
      recommendedAt: rec.recommendedAt,
      respondedAt: rec.respondedAt,
      candidateNotes: rec.candidateNotes,
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
    console.error('Erro ao listar indicações do candidato:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar indicações' },
      { status: 500 }
    );
  }
}

// PUT - Candidato responder à indicação (aceitar/rejeitar)
export async function PUT(request: NextRequest) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas candidatos' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { recommendationId, status, candidateNotes } = data;

    await connectMongoDB();

    // Buscar a indicação
    const recommendation = await JobRecommendation.findOne({
      _id: recommendationId,
      candidateId: candidate._id,
      isActive: true
    });

    if (!recommendation) {
      return NextResponse.json(
        { success: false, message: 'Indicação não encontrada' },
        { status: 404 }
      );
    }

    // Validar status
    if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status inválido' },
        { status: 400 }
      );
    }

    // Atualizar indicação
    recommendation.status = status;
    recommendation.respondedAt = new Date();
    if (candidateNotes) {
      recommendation.candidateNotes = candidateNotes;
    }

    await recommendation.save();

    return NextResponse.json({
      success: true,
      message: 'Resposta enviada com sucesso',
      data: {
        id: recommendation._id,
        status: recommendation.status,
        respondedAt: recommendation.respondedAt,
        candidateNotes: recommendation.candidateNotes
      }
    });

  } catch (error) {
    console.error('Erro ao responder indicação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao responder indicação' },
      { status: 500 }
    );
  }
}
