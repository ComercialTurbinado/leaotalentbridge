import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password, type } = await request.json();

    // Validar dados de entrada
    if (!email || !password || !type) {
      return NextResponse.json(
        { success: false, message: 'Email, senha e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se JWT_SECRET está configurado
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não configurado');
      return NextResponse.json(
        { success: false, message: 'Configuração de segurança não encontrada' },
        { status: 500 }
      );
    }

    // Conectar ao MongoDB
    const mongoConnection = await connectMongoDB();
    if (!mongoConnection) {
      console.error('Falha na conexão com MongoDB');
      return NextResponse.json(
        { success: false, message: 'Erro de conexão com o banco de dados' },
        { status: 500 }
      );
    }
    
    // Buscar usuário no banco
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      type 
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Gerar JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        type: user.type 
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Retornar dados do usuário (sem a senha)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      type: user.type,
      profile: user.profile
    };

    return NextResponse.json({
      success: true,
      user: userData,
      token,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 