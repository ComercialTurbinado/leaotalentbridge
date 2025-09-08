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
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido ou inválido' },
        { status: 401 }
      );
    }
    
    const { id: candidateId } = await context.params;
    
    // Verificar se o usuário pode acessar os dados (próprio usuário ou admin)
    if (user._id !== candidateId && user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Buscar progresso do candidato
    const progressFilter: any = { userId: candidateId };
    if (status) {
      progressFilter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const courseProgress = await CourseProgress.find(progressFilter)
      .sort({ lastAccessedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    if (courseProgress.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      });
    }
    
    // Buscar detalhes dos cursos
    const courseIds = courseProgress.map(p => p.courseId);
    
    const courseFilter: any = {
      _id: { $in: courseIds },
      status: 'published',
      isPublic: true
    };
    
    if (category) {
      courseFilter.category = category;
    }
    
    const courses = await Course.find(courseFilter)
      .select('title slug shortDescription thumbnail category level totalDuration totalLessons instructor pricing hasCertificate')
      .lean();
    
    // Combinar dados do curso com progresso
    const coursesWithProgress = courses.map(course => {
      const progress = courseProgress.find(p => p.courseId.toString() === (course._id as any).toString());
      return {
        ...course,
        progress: progress ? {
          status: progress.status,
          progress: progress.progress,
          startedAt: progress.startedAt,
          completedAt: progress.completedAt,
          lastAccessedAt: progress.lastAccessedAt,
          totalTimeSpent: progress.totalTimeSpent,
          certificateEarned: progress.certificateEarned,
          lessonsCompleted: progress.lessons?.filter((l: any) => l.completed).length || 0,
          totalLessons: progress.lessons?.length || 0
        } : null
      };
    });
    
    // Contar total para paginação
    const total = await CourseProgress.countDocuments(progressFilter);
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: coursesWithProgress,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar cursos do candidato:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
