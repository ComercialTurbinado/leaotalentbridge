import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import Job from '@/lib/models/Job';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

// Middleware para verificar autenticação
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Listar candidaturas
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');
    const companyId = searchParams.get('companyId');
    const candidateId = searchParams.get('candidateId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    // Construir filtro baseado no tipo de usuário
    const filter: any = {};
    
    if (user.type === 'candidato') {
      // Candidatos só veem suas próprias candidaturas
      filter.candidateId = user._id;
    } else if (user.type === 'empresa') {
      // Empresas só veem candidaturas para suas vagas
      const company = await Company.findOne({ email: user.email });
      if (company) {
        filter.companyId = company._id;
      } else {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page: 1, limit, total: 0, pages: 0 }
        });
      }
    }
    // Admin vê todas
    
    // Aplicar filtros adicionais
    if (status) filter.status = status;
    if (jobId) filter.jobId = jobId;
    if (companyId && user.type === 'admin') filter.companyId = companyId;
    if (candidateId && user.type !== 'candidato') filter.candidateId = candidateId;
    
    const skip = (page - 1) * limit;
    
    let query = Application.find(filter)
      .populate('jobId', 'title status location workType salary category')
      .populate('candidateId', 'name email profile.phone profile.avatar')
      .populate('companyId', 'name logo industry')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Se houver busca, aplicar filtro de texto
    if (search) {
      // Implementar busca por nome do candidato ou título da vaga
      query = query.populate({
        path: 'candidateId',
        match: { name: { $regex: search, $options: 'i' } }
      }).populate({
        path: 'jobId',
        match: { title: { $regex: search, $options: 'i' } }
      });
    }
    
    const applications = await query;
    const total = await Application.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar candidaturas' },
      { status: 500 }
    );
  }
}

// POST - Criar nova candidatura
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.type !== 'candidato') {
      return NextResponse.json(
        { success: false, message: 'Apenas candidatos podem se candidatar' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.jobId) {
      return NextResponse.json(
        { success: false, message: 'ID da vaga é obrigatório' },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    // Verificar se a vaga existe e está ativa
    const job = await Job.findById(data.jobId).populate('companyId');
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Vaga não encontrada' },
        { status: 404 }
      );
    }
    
    if (job.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Esta vaga não está mais ativa' },
        { status: 400 }
      );
    }
    
    // Verificar se já existe candidatura para esta vaga
    const existingApplication = await Application.findOne({
      jobId: data.jobId,
      candidateId: user._id
    });
    
    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'Você já se candidatou para esta vaga' },
        { status: 409 }
      );
    }
    
    // Verificar limite máximo de candidaturas da vaga
    if (job.maxApplications) {
      const currentApplications = await Application.countDocuments({ jobId: data.jobId });
      if (currentApplications >= job.maxApplications) {
        return NextResponse.json(
          { success: false, message: 'Limite de candidaturas atingido para esta vaga' },
          { status: 400 }
        );
      }
    }
    
    // Criar candidatura
    const applicationData = {
      jobId: data.jobId,
      candidateId: user._id,
      companyId: job.companyId._id,
      coverLetter: data.coverLetter,
      salaryExpectation: data.salaryExpectation,
      availabilityDate: data.availabilityDate,
      customAnswers: data.customAnswers || [],
      documents: data.documents || [],
      source: data.source || 'direct',
      communicationPreference: data.communicationPreference || 'email'
    };
    
    const application = new Application(applicationData);
    
    // Se a vaga tem screening automático, executar
    if (job.autoScreening) {
      // Implementar lógica de screening automático aqui
      // Por enquanto, score básico
      application.screening = {
        score: 75,
        criteria: {
          education: 80,
          experience: 80,
          skills: 80,
          location: 80,
          salary: 80,
          overall: 80
        },
        passedScreening: true,
        automatedDate: new Date(),
        notes: 'Screening automático realizado'
      };
      
      application.status = 'qualified';
    }
    
    await application.save();
    
    // Atualizar métricas da vaga
    await Job.findByIdAndUpdate(data.jobId, {
      $inc: { 
        'metrics.applications': 1,
        'metrics.qualified': application.status === 'qualified' ? 1 : 0
      }
    });
    
    // Atualizar estatísticas da empresa
    // const company = await Company.findById(job.companyId._id);
    // if (company) {
    //   await company.updateStats();
    // }
    
    return NextResponse.json({
      success: true,
      data: application,
      message: 'Candidatura enviada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar candidatura:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar candidatura' },
      { status: 500 }
    );
  }
} 