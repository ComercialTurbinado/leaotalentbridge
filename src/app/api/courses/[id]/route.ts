import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import connectMongoDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import CourseProgress from '@/lib/models/CourseProgress';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    
    const { id: courseId } = await context.params;
    
    // Buscar curso
    const course = await Course.findOne({
      $or: [
        { _id: courseId },
        { slug: courseId }
      ],
      status: 'published',
      isPublic: true
    }).lean();
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso não encontrado' },
        { status: 404 }
      );
    }
    
    // Se o usuário estiver logado, buscar progresso do curso
    let courseWithProgress = course;
    
    const user = await verifyAuth(request);
    if (user) {
      const userId = user._id;
      
      const progress = await CourseProgress.findOne({
        userId,
        courseId: (course as any)._id
      }).lean();
      
      courseWithProgress = {
        ...course,
        userProgress: progress ? {
          status: (progress as any).status,
          progress: (progress as any).progress,
          startedAt: (progress as any).startedAt,
          completedAt: (progress as any).completedAt,
          lastAccessedAt: (progress as any).lastAccessedAt,
          lessons: (progress as any).lessons,
          totalTimeSpent: (progress as any).totalTimeSpent,
          certificateEarned: (progress as any).certificateEarned
        } : null
      };
    }
    
    return NextResponse.json({
      success: true,
      data: courseWithProgress
    });
    
  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    await connectMongoDB();
    
    const { id: courseId } = await context.params;
    const body = await request.json();
    
    // Verificar se curso existe
    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Curso não encontrado' },
        { status: 404 }
      );
    }
    
    // Atualizar metadados
    body.lastModifiedBy = user._id;
    body.lastUpdatedAt = new Date();
    
    // Se status mudou para published e não tinha publishedAt
    if (body.status === 'published' && !existingCourse.publishedAt) {
      body.publishedAt = new Date();
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      data: updatedCourse
    });
    
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    await connectMongoDB();
    
    const { id: courseId } = await context.params;
    
    // Verificar se curso existe
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se há progresso de usuários (não permitir deletar)
    const hasProgress = await CourseProgress.countDocuments({ courseId });
    if (hasProgress > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar curso com progresso de usuários. Arquive o curso em vez disso.' },
        { status: 400 }
      );
    }
    
    await Course.findByIdAndDelete(courseId);
    
    return NextResponse.json({
      success: true,
      message: 'Curso deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar curso:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
