import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
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

// GET - Listar todas as empresas (admin)
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
    const industry = searchParams.get('industry');
    const size = searchParams.get('size');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    // Construir filtro
    const filter: any = {};
    if (industry) filter.industry = industry;
    if (size) filter.size = size;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Buscar empresas
    const companies = await Company.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
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

// POST - Criar nova empresa (admin)
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
    const { name, email, industry, size, location, website, description, logo } = data;
    
    if (!name || !email || !industry) {
      return NextResponse.json(
        { success: false, message: 'Nome, email e indústria são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    // Verificar se email já existe
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Criar nova empresa
    const newCompany = new Company({
      name,
      email,
      industry,
      size: size || 'medium',
      location: location || {},
      website: website || '',
      description: description || '',
      logo: logo || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCompany.save();

    return NextResponse.json({
      success: true,
      data: newCompany,
      message: 'Empresa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar empresa' },
      { status: 500 }
    );
  }
}
