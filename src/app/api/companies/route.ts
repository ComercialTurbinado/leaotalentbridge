import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
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

// GET - Listar empresas
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const size = searchParams.get('size');
    const verified = searchParams.get('verified');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    // Construir filtro
    const filter: any = {};
    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (size) filter.size = size;
    if (verified) filter.isVerified = verified === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const companies = await Company.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    const total = await Company.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar empresas' },
      { status: 500 }
    );
  }
}

// POST - Criar nova empresa
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
    if (!data.name || !data.email || !data.industry || !data.size || !data.address || !data.primaryContact) {
      return NextResponse.json(
        { success: false, message: 'Dados obrigatórios: name, email, industry, size, address, primaryContact' },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    // Verificar se email já existe
    const existingCompany = await Company.findOne({ email: data.email.toLowerCase() });
    if (existingCompany) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado' },
        { status: 409 }
      );
    }
    
    // Definir plano padrão se não fornecido
    if (!data.plan) {
      data.plan = {
        type: 'basic',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        features: ['basic_jobs', 'basic_support'],
        maxJobs: 5,
        maxCandidates: 50,
        isActive: true
      };
    }
    
    const company = new Company(data);
    await company.save();
    
    return NextResponse.json({
      success: true,
      data: company,
      message: 'Empresa criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar empresa' },
      { status: 500 }
    );
  }
} 