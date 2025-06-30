import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, type, profile } = await request.json();

    // Validar dados obrigatórios
    if (!email || !password || !name || !type) {
      return NextResponse.json(
        { success: false, message: 'Email, senha, nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de usuário
    if (!['candidato', 'empresa', 'admin'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de usuário inválido' },
        { status: 400 }
      );
    }

    // Conectar ao MongoDB
    await connectMongoDB();

    // Verificar se email já existe
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Criptografar senha
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar novo usuário
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      type,
      profile: {
        completed: false,
        ...profile
      }
    });

    await newUser.save();

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        email: newUser.email, 
        type: newUser.type 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário (sem a senha)
    const userData = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      type: newUser.type,
      profile: newUser.profile
    };

    return NextResponse.json({
      success: true,
      user: userData,
      token,
      message: 'Cadastro realizado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Verificar se é erro de duplicata
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 