import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Verificar autenticação de admin
async function verifyAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    const user = await User.findById(decoded.userId);
    return user?.type === 'admin' ? user : null;
  } catch (error) {
    return null;
  }
}

// GET - Listar todos os usuários (admin)
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    // Construir filtro
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    // Buscar usuários
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

// POST - Criar novo usuário (admin)
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
    console.log('📝 Dados recebidos para criação de usuário:', JSON.stringify(data, null, 2));
    
    const { 
      name, email, password, type, status = 'approved', tempPassword,
      profile = {}, permissions = {}, profileVerified = false, documentsVerified = false 
    } = data;
    
    if (!name || !email || !type) {
      return NextResponse.json(
        { success: false, message: 'Nome, email e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Definir senha (temporária ou fornecida)
    const userPassword = tempPassword || password || Math.random().toString(36).slice(-8);
    console.log('🔑 Senha definida para usuário:', userPassword);
    
    // Encriptar senha
    const hashedPassword = await bcrypt.hash(userPassword, 12);
    console.log('🔐 Senha encriptada com sucesso');
    
    // Preparar objeto do usuário
    const userData = {
      name,
      email,
      password: hashedPassword, // Senha já encriptada
      type,
      status,
      profile: {
        completed: false,
        ...profile
      },
      permissions: {
        canAccessJobs: false,
        canApplyToJobs: false,
        canViewCourses: true,
        canAccessSimulations: false,
        canContactCompanies: false,
        ...permissions
      },
      profileVerified,
      documentsVerified,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔧 Objeto do usuário a ser criado:', JSON.stringify(userData, null, 2));
    
    // Criar novo usuário
    const newUser = new User(userData);

    await newUser.save();
    
    // Retornar usuário sem senha
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: `Usuário criado com sucesso${tempPassword ? ` - Senha: ${tempPassword}` : ''}`
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    console.error('Detalhes do erro:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Se for erro de validação do Mongoose, retornar detalhes
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro de validação dos dados',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
