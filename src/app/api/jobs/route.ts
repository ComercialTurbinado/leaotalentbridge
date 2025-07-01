import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import Application from '@/lib/models/Application';
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

// GET - Listar vagas
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const workType = searchParams.get('workType');
    const location = searchParams.get('location');
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    
    // Construir filtro
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (workType) filter.workType = workType;
    if (companyId) filter.companyId = companyId;
    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (salaryMin || salaryMax) {
      filter['salary.min'] = {};
      if (salaryMin) filter['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) filter['salary.max'] = { $lte: parseInt(salaryMax) };
    }
    
    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(filter)
      .populate('companyId', 'name logo industry size location')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    const total = await Job.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar vagas' },
      { status: 500 }
    );
  }
}

// POST - Criar nova vaga
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || (user.type !== 'admin' && user.type !== 'empresa')) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.title || !data.description || !data.summary || !data.location || 
        !data.workType || !data.salary || !data.requirements || !data.category || !data.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Dados obrigatórios: title, description, summary, location, workType, salary, requirements, category, expiresAt' },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    // Se não for admin, verificar se companyId corresponde ao usuário
    let companyId = data.companyId;
    if (user.type === 'empresa') {
      const company = await Company.findOne({ email: user.email });
      if (!company) {
        return NextResponse.json(
          { success: false, message: 'Empresa não encontrada para este usuário' },
          { status: 404 }
        );
      }
      companyId = company._id;
    }
    
    // Verificar se a empresa existe
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar limites do plano
    if (company.plan?.isActive) {
      const activeJobs = await Job.countDocuments({ 
        companyId: companyId, 
        status: { $in: ['active', 'draft'] } 
      });
      
      if (activeJobs >= company.plan.maxJobs) {
        return NextResponse.json(
          { success: false, message: `Limite de vagas atingido (${company.plan.maxJobs})` },
          { status: 400 }
        );
      }
    }
    
    // Gerar slug único
    const baseSlug = data.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    let slug = baseSlug;
    let counter = 1;
    while (await Job.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const jobData = {
      ...data,
      companyId,
      createdBy: user._id,
      slug,
      publishedAt: data.status === 'active' ? new Date() : undefined
    };
    
    const job = new Job(jobData);
    await job.save();
    
    // Atualizar estatísticas da empresa
    // await company.updateStats();
    
    return NextResponse.json({
      success: true,
      data: job,
      message: 'Vaga criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar vaga', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 