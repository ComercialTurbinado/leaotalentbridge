import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Simulation from '@/lib/models/Simulation';

// GET - Listar todas as simulações
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    // Extrair parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Construir filtro
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    // Calcular skip para paginação
    const skip = (page - 1) * limit;
    
    // Buscar simulações com paginação
    const simulations = await Simulation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');
    
    // Contar total de documentos
    const total = await Simulation.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: simulations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar simulações:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar simulações' },
      { status: 500 }
    );
  }
}

// POST - Criar nova simulação (apenas para admins)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar dados obrigatórios
    if (!data.title || !data.description || !data.questions || !data.estimatedTime) {
      return NextResponse.json(
        { success: false, message: 'Título, descrição, perguntas e tempo estimado são obrigatórios' },
        { status: 400 }
      );
    }
    
    await connectMongoDB();
    
    // Criar nova simulação
    const simulation = new Simulation({
      title: data.title,
      description: data.description,
      questions: data.questions,
      estimatedTime: data.estimatedTime,
      category: data.category || 'general',
      difficulty: data.difficulty || 'basic',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
    
    await simulation.save();
    
    return NextResponse.json({
      success: true,
      data: simulation,
      message: 'Simulação criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar simulação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao criar simulação' },
      { status: 500 }
    );
  }
} 