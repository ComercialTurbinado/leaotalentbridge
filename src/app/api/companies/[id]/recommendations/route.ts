import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import JobRecommendation from '@/lib/models/JobRecommendation';
import Company from '@/lib/models/Company';
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
    return user?.type === 'company' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar candidatos indicados para a empresa (sem dados pessoais)
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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');

    await connectMongoDB();

    // Verificar se a empresa existe e se o usuário tem acesso
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Construir filtros
    const filters: any = { 
      companyId,
      isActive: true 
    };
    
    if (status && status !== 'all') {
      filters.status = status;
    }

    if (jobId) {
      filters.jobId = jobId;
    }

    // Calcular paginação
    const skip = (page - 1) * limit;
    const total = await JobRecommendation.countDocuments(filters);
    const pages = Math.ceil(total / limit);

    // Buscar indicações com dados do candidato (apenas profissionais)
    const recommendations = await JobRecommendation.find(filters)
      .populate('jobId', 'title category location workType salary status')
      .populate('candidateId', 'name profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Processar dados para resposta (anonimizando dados pessoais do candidato)
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
      // Dados profissionais anonimizados do candidato
      candidate: {
        id: rec.candidateId._id,
        name: rec.candidateId.name,
        // Apenas informações profissionais do perfil
        profile: {
          skills: rec.candidateId.profile?.skills || [],
          experience: rec.candidateId.profile?.experience || '',
          education: rec.candidateId.profile?.education || '',
          location: rec.candidateId.profile?.location || {},
          // Remover dados pessoais como email, telefone, etc.
        }
      },
      status: rec.status,
      recommendedAt: rec.recommendedAt,
      respondedAt: rec.respondedAt,
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
    console.error('Erro ao listar indicações da empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao listar indicações' },
      { status: 500 }
    );
  }
}

// PUT - Empresa responder à indicação (aceitar/rejeitar)
export async function PUT(
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
    const data = await request.json();
    const { recommendationId, status, companyNotes } = data;

    await connectMongoDB();

    // Buscar a indicação
    const recommendation = await JobRecommendation.findOne({
      _id: recommendationId,
      companyId,
      isActive: true
    });

    if (!recommendation) {
      return NextResponse.json(
        { success: false, message: 'Indicação não encontrada' },
        { status: 404 }
      );
    }

    // Validar status
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status inválido' },
        { status: 400 }
      );
    }

    // Atualizar indicação
    recommendation.status = status;
    recommendation.respondedAt = new Date();
    if (companyNotes) {
      recommendation.companyNotes = companyNotes;
    }

    await recommendation.save();

    return NextResponse.json({
      success: true,
      message: 'Resposta enviada com sucesso',
      data: {
        id: recommendation._id,
        status: recommendation.status,
        respondedAt: recommendation.respondedAt,
        companyNotes: recommendation.companyNotes
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
