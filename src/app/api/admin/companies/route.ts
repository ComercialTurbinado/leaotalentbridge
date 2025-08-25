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
    const { 
      name, email, cnpj, phone, industry, size, address, website, description, logo, 
      primaryContact, status = 'pending' 
    } = data;
    
    if (!name || !email || !industry || !primaryContact?.name || !primaryContact?.position) {
      return NextResponse.json(
        { success: false, message: 'Nome, email, indústria e contato responsável são obrigatórios' },
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

    // Verificar se email já existe em usuários
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado como usuário' },
        { status: 400 }
      );
    }

    // Criar usuário para a empresa
    const userPassword = Math.random().toString(36).slice(-8); // Senha aleatória de 8 caracteres
    const newUser = new User({
      email,
      password: userPassword, // Será hasheada pelo middleware
      name: primaryContact.name,
      type: 'empresa',
      status: 'approved',
      profile: {
        completed: false,
        company: name,
        position: primaryContact.position
      }
    });

    await newUser.save();

    // Criar nova empresa
    const newCompany = new Company({
      name,
      email,
      cnpj: cnpj || '',
      phone: phone || '',
      industry,
      size: size || 'medium',
      address: address || {
        street: '',
        city: '',
        state: '',
        country: 'EAU',
        zipCode: ''
      },
      website: website || '',
      description: description || '',
      logo: logo || '',
      primaryContact: {
        name: primaryContact.name,
        position: primaryContact.position,
        email: primaryContact.email || email,
        phone: primaryContact.phone || phone
      },
      status,
      isVerified: false,
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
