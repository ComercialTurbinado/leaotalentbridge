import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Simulation from '@/lib/models/Simulation';
import SimulationAnswer from '@/lib/models/SimulationAnswer';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Buscar simulações disponíveis para o candidato com progresso
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

    // Verificar se pode acessar os dados deste candidato
    const canView = user.type === 'admin' || user._id.toString() === resolvedParams.id;
    
    if (!canView) {
      return NextResponse.json(
        { success: false, message: 'Acesso negado' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    // Buscar todas as simulações ativas
    const simulations = await Simulation.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('-__v');

    // Buscar respostas do usuário para todas as simulações
    const userAnswers = await SimulationAnswer.find({ 
      userId: resolvedParams.id 
    }).select('simulationId completedAt score status answers');

    // Mapear simulações com progresso do usuário
    const simulationsWithProgress = simulations.map(simulation => {
      const userAnswer = userAnswers.find(
        answer => answer.simulationId.toString() === simulation._id.toString()
      );

      return {
        _id: simulation._id,
        title: simulation.title,
        description: simulation.description,
        category: simulation.category,
        difficulty: simulation.difficulty,
        estimatedTime: simulation.estimatedTime,
        questionsCount: simulation.questions.length,
        completed: userAnswer?.status === 'completed' || false,
        completedAt: userAnswer?.completedAt || null,
        score: userAnswer?.score || null,
        status: userAnswer?.status || 'not_started',
        progress: userAnswer ? {
          answeredQuestions: userAnswer.answers?.length || 0,
          totalQuestions: simulation.questions.length,
          percentage: Math.round(((userAnswer.answers?.length || 0) / simulation.questions.length) * 100)
        } : {
          answeredQuestions: 0,
          totalQuestions: simulation.questions.length,
          percentage: 0
        }
      };
    });

    // Organizar por categoria
    const categorizedSimulations = simulationsWithProgress.reduce((acc, sim) => {
      if (!acc[sim.category]) {
        acc[sim.category] = [];
      }
      acc[sim.category].push(sim);
      return acc;
    }, {} as Record<string, any[]>);

    // Calcular estatísticas gerais
    const totalSimulations = simulations.length;
    const completedSimulations = simulationsWithProgress.filter(s => s.completed).length;
    const averageScore = userAnswers.length > 0 
      ? userAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0) / userAnswers.length 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        simulations: simulationsWithProgress,
        categorized: categorizedSimulations,
        statistics: {
          total: totalSimulations,
          completed: completedSimulations,
          inProgress: simulationsWithProgress.filter(s => s.status === 'in_progress').length,
          averageScore: Math.round(averageScore * 10) / 10,
          completionRate: Math.round((completedSimulations / totalSimulations) * 100)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar simulações:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
