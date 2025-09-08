import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Simulation from '@/lib/models/Simulation';
import SimulationAnswer from '@/lib/models/SimulationAnswer';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Buscar simulação específica com progresso do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    await connectMongoDB();

    // Buscar a simulação
    const simulation = await Simulation.findById(resolvedParams.id);
    
    if (!simulation) {
      return NextResponse.json(
        { success: false, message: 'Simulação não encontrada' },
        { status: 404 }
      );
    }

    // Buscar respostas do usuário para esta simulação
    const userAnswer = await SimulationAnswer.findOne({
      userId: user._id,
      simulationId: resolvedParams.id
    });

    // Preparar dados da simulação com progresso
    const simulationData = {
      _id: simulation._id,
      title: simulation.title,
      description: simulation.description,
      category: simulation.category,
      difficulty: simulation.difficulty,
      estimatedTime: simulation.estimatedTime,
      questions: simulation.questions,
      userProgress: userAnswer ? {
        status: userAnswer.status,
        answers: userAnswer.answers,
        completedAt: userAnswer.completedAt,
        score: userAnswer.score,
        feedback: userAnswer.feedback,
        answeredQuestions: userAnswer.answers?.length || 0,
        totalQuestions: simulation.questions.length,
        percentage: Math.round(((userAnswer.answers?.length || 0) / simulation.questions.length) * 100)
      } : {
        status: 'not_started',
        answers: [],
        completedAt: null,
        score: null,
        feedback: null,
        answeredQuestions: 0,
        totalQuestions: simulation.questions.length,
        percentage: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: simulationData
    });

  } catch (error) {
    console.error('Erro ao buscar simulação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Salvar progresso da simulação
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers, isCompleted = false } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: 'Respostas são obrigatórias' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Verificar se a simulação existe
    const simulation = await Simulation.findById(resolvedParams.id);
    if (!simulation) {
      return NextResponse.json(
        { success: false, message: 'Simulação não encontrada' },
        { status: 404 }
      );
    }

    // Buscar ou criar resposta do usuário
    let userAnswer = await SimulationAnswer.findOne({
      userId: user._id,
      simulationId: resolvedParams.id
    });

    const answerData = {
      answers: answers.map((answer: any, index: number) => ({
        questionId: answer.questionId || (index + 1),
        text: answer.text || answer.answer || '',
        timestamp: answer.timestamp || new Date()
      })),
      status: isCompleted ? 'completed' : 'in_progress',
      ...(isCompleted && { completedAt: new Date() })
    };

    if (userAnswer) {
      // Atualizar resposta existente
      Object.assign(userAnswer, answerData);
      await userAnswer.save();
    } else {
      // Criar nova resposta
      userAnswer = new SimulationAnswer({
        userId: user._id,
        simulationId: resolvedParams.id,
        ...answerData
      });
      await userAnswer.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: userAnswer._id,
        status: userAnswer.status,
        answeredQuestions: userAnswer.answers.length,
        totalQuestions: simulation.questions.length,
        percentage: Math.round((userAnswer.answers.length / simulation.questions.length) * 100),
        completedAt: userAnswer.completedAt
      },
      message: isCompleted ? 'Simulação concluída com sucesso!' : 'Progresso salvo com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
