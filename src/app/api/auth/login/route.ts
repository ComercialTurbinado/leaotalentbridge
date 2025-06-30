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

    // Conectar ao MongoDB
    await connectMongoDB();
    
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
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
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
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 