import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Simulation from '@/lib/models/Simulation';

// GET - Buscar simulação por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectMongoDB();
    
    const simulation = await Simulation.findById(resolvedParams.id).select('-__v');
    
    if (!simulation) {
      return NextResponse.json(
        { success: false, message: 'Simulação não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se a simulação está ativa
    if (!simulation.isActive) {
      return NextResponse.json(
        { success: false, message: 'Simulação não está disponível' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    console.error('Erro ao buscar simulação:', error);
    
    // Verificar se é um ID inválido do MongoDB
    if ((error as any).name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'ID de simulação inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Erro ao buscar simulação' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar simulação (apenas para admins)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const resolvedParams = await params;
    
    await connectMongoDB();
    
    const simulation = await Simulation.findByIdAndUpdate(
      resolvedParams.id,
      {
        $set: {
          title: data.title,
          description: data.description,
          questions: data.questions,
          estimatedTime: data.estimatedTime,
          category: data.category,
          difficulty: data.difficulty,
          isActive: data.isActive,
          updatedAt: new Date()
        }
      },
      { 
        new: true, // Retorna o documento atualizado
        runValidators: true // Executa validações do schema
      }
    ).select('-__v');
    
    if (!simulation) {
      return NextResponse.json(
        { success: false, message: 'Simulação não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: simulation,
      message: 'Simulação atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar simulação:', error);
    
    if ((error as any).name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'ID de simulação inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar simulação' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar simulação (apenas para admins)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await connectMongoDB();
    
    // Soft delete - marcar como inativa ao invés de deletar
    const simulation = await Simulation.findByIdAndUpdate(
      resolvedParams.id,
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date() 
        } 
      },
      { new: true }
    );
    
    if (!simulation) {
      return NextResponse.json(
        { success: false, message: 'Simulação não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Simulação removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar simulação:', error);
    
    if ((error as any).name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'ID de simulação inválido' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Erro ao deletar simulação' },
      { status: 500 }
    );
  }
} 