import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    await connectMongoDB();
    return await User.findById(decoded.userId);
  } catch (error) {
    return null;
  }
}

// GET - Listar usuários (apenas admin)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search');
    
    const filter: any = {};
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

// POST - Criar usuário (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.type !== 'admin') {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();
    
    if (!data.email || !data.password || !data.name || !data.type) {
      return NextResponse.json(
        { success: false, message: 'E-mail, senha, nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();
    
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'E-mail já cadastrado' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const newUser = new User({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name.trim(),
      type: data.type,
      profile: data.profile || { completed: false }
    });

    await newUser.save();
    
    const userData = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      type: newUser.type,
      profile: newUser.profile,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      success: true,
      data: userData,
      message: 'Usuário criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao criar usuário' }, { status: 500 });
  }
} 