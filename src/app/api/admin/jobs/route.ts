import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Job from '@/lib/models/Job';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
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

// GET - Listar todas as vagas (admin)
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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const companyId = searchParams.get('companyId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    // Construir filtro
    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (companyId) filter.companyId = companyId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Buscar vagas com dados da empresa
    const jobs = await Job.find(filter)
      .populate('companyId', 'name industry logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
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

// POST - Criar nova vaga (admin)
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
    const { 
      title, 
      description, 
      summary, 
      companyId, 
      category, 
      location, 
      workType, 
      salary, 
      requirements 
    } = data;
    
    if (!title || !description || !companyId || !category) {
      return NextResponse.json(
        { success: false, message: 'Título, descrição, empresa e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    // Verificar se a empresa existe
    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Empresa não encontrada' },
        { status: 400 }
      );
    }

    // Criar nova vaga
    const newJob = new Job({
      title,
      description,
      summary: summary || '',
      companyId,
      category,
      location: location || {},
      workType: workType || 'full-time',
      workSchedule: data.workSchedule || 'flexible',
      salary: salary || { min: 0, max: 0, currency: 'BRL' },
      requirements: requirements || { skills: [], education: '', experience: '' },
      tags: data.tags || [],
      status: 'active',
      publishedAt: new Date(),
      expiresAt: data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      createdBy: admin._id,
      lastModifiedBy: admin._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newJob.save();

    // Popular dados da empresa para retorno
    const jobWithCompany = await Job.findById(newJob._id).populate('companyId', 'name industry logo');

    return NextResponse.json({
      success: true,
      data: jobWithCompany,
      message: 'Vaga criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar vaga' },
      { status: 500 }
    );
  }
}
