import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// GET - Listar candidatos
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const candidatos = await User.find({ type: 'candidato' })
      .select('-password -__v')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: {
        total: candidatos.length,
        candidatos
      },
      message: `${candidatos.length} candidato(s) encontrado(s) no sistema`
    });
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar candidatos' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar candidato específico
export async function PATCH(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { email, password, status } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email é obrigatório'
      }, { status: 400 });
    }
    
    const candidato = await User.findOne({ email, type: 'candidato' });
    
    if (!candidato) {
      return NextResponse.json({
        success: false,
        message: 'Candidato não encontrado'
      }, { status: 404 });
    }
    
    // Atualizar senha se fornecida
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      candidato.password = hashedPassword;
      console.log(`Senha atualizada para candidato ${email}: ${password}`);
    }
    
    // Atualizar status se fornecido
    if (status) {
      candidato.status = status;
    }
    
    await candidato.save();
    
    return NextResponse.json({
      success: true,
      data: {
        _id: candidato._id,
        email: candidato.email,
        name: candidato.name,
        type: candidato.type,
        status: candidato.status
      },
      message: `Candidato ${email} atualizado com sucesso`
    });
  } catch (error) {
    console.error('Erro ao atualizar candidato:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar candidato' },
      { status: 500 }
    );
  }
}
