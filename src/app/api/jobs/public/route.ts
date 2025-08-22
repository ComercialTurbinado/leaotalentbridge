import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
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
    return user?.type === 'candidato' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar vagas públicas para candidatos (sem informações da empresa)
export async function GET(request: NextRequest) {
  try {
    const candidate = await verifyCandidateAuth(request);
    if (!candidate) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado - Apenas candidatos' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const workType = searchParams.get('workType');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    const salaryMin = searchParams.get('salaryMin');
    const salaryMax = searchParams.get('salaryMax');
    
    // Construir filtro - apenas vagas ativas
    const filter: any = { status: 'active' };
    if (category) filter.category = category;
    if (workType) filter.workType = workType;
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
    
    // Buscar vagas sem informações da empresa
    const jobs = await Job.find(filter)
      .select('-companyId -createdBy -lastModifiedBy -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Job.countDocuments(filter);
    
    // Formatar dados para candidatos (sem informações da empresa)
    const formattedJobs = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      summary: job.summary,
      department: job.department,
      location: job.location,
      workType: job.workType,
      workSchedule: job.workSchedule,
      salary: job.salary,
      requirements: job.requirements,
      category: job.category,
      tags: job.tags,
      publishedAt: job.publishedAt,
      expiresAt: job.expiresAt,
      // Informações anonimizadas da empresa
      company: {
        industry: 'Confidencial',
        size: 'Confidencial',
        location: 'Confidencial'
      }
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vagas públicas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar vagas' },
      { status: 500 }
    );
  }
}
