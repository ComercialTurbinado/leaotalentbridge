import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import SimulationAnswer from '@/lib/models/SimulationAnswer';
import User from '@/lib/models/User';
import Simulation from '@/lib/models/Simulation';
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

// POST - Salvar respostas da simulação
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const { simulationId, answers } = await request.json();

    // Validar dados obrigatórios
    if (!simulationId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: 'ID da simulação e respostas são obrigatórios' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Verificar se a simulação existe
    const simulation = await Simulation.findById(simulationId);
    if (!simulation) {
      return NextResponse.json(
        { success: false, message: 'Simulação não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma resposta para esta simulação
    let existingAnswer = await SimulationAnswer.findOne({
      userId: user._id,
      simulationId: simulationId
    });

    if (existingAnswer) {
      // Atualizar resposta existente
      existingAnswer.answers = answers;
      existingAnswer.completedAt = new Date();
      existingAnswer.status = 'completed';
      
      await existingAnswer.save();
      
      return NextResponse.json({
        success: true,
        data: existingAnswer,
        message: 'Respostas atualizadas com sucesso'
      });
    } else {
      // Criar nova resposta
      const newAnswer = new SimulationAnswer({
        userId: user._id,
        simulationId: simulationId,
        answers: answers,
        completedAt: new Date(),
        status: 'completed'
      });

      await newAnswer.save();
      
      return NextResponse.json({
        success: true,
        data: newAnswer,
        message: 'Respostas salvas com sucesso'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Listar respostas do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get('simulationId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    await connectMongoDB();

    // Construir filtro
    const filter: any = { userId: user._id };
    if (simulationId) filter.simulationId = simulationId;
    if (status) filter.status = status;

    // Calcular skip para paginação
    const skip = (page - 1) * limit;

    // Buscar respostas com paginação
    const simulationAnswers = await SimulationAnswer.find(filter)
      .populate('simulationId', 'title description category difficulty')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Contar total de documentos
    const total = await SimulationAnswer.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: simulationAnswers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar respostas:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 