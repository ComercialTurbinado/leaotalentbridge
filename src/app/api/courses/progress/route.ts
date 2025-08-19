import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CourseProgress from '@/lib/models/CourseProgress';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await connectMongoDB();
    return await User.findById(decoded.userId);
  } catch (error) {
    return null;
  }
}

// GET - Buscar progresso do usuário em cursos
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o usuário tem permissão para ver cursos
    if (user.type !== 'admin' && !user.permissions?.canViewCourses) {
      return NextResponse.json({ 
        success: false, 
        message: 'Você não tem permissão para acessar cursos' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    await connectMongoDB();

    let filter: any = { userId: user._id };
    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;

    const progressData = await CourseProgress.find(filter)
      .populate('courseId', 'title description category duration difficulty thumbnail')
      .sort({ lastAccessedAt: -1 });

    return NextResponse.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar progresso' }, { status: 500 });
  }
}

// POST - Iniciar ou atualizar progresso de um curso
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Token inválido' }, { status: 401 });
    }

    // Verificar permissões
    if (user.type !== 'admin' && !user.permissions?.canViewCourses) {
      return NextResponse.json({ 
        success: false, 
        message: 'Você não tem permissão para acessar cursos' 
      }, { status: 403 });
    }

    const { courseId, action, lessonId, lessonTitle, timeSpent, quizData } = await request.json();

    if (!courseId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'courseId e action são obrigatórios' 
      }, { status: 400 });
    }

    await connectMongoDB();

    // Buscar ou criar progresso
    let progress = await CourseProgress.findOne({ userId: user._id, courseId });
    
    if (!progress) {
      progress = new CourseProgress({
        userId: user._id,
        courseId,
        lessons: []
      });
    }

    switch (action) {
      case 'start_course':
        if (progress.status === 'not_started') {
          progress.status = 'in_progress';
          progress.startedAt = new Date();
        }
        break;

      case 'complete_lesson':
        if (!lessonId || !lessonTitle) {
          return NextResponse.json({ 
            success: false, 
            message: 'lessonId e lessonTitle são obrigatórios para completar lição' 
          }, { status: 400 });
        }
        await progress.markLessonComplete(lessonId, lessonTitle, timeSpent || 0);
        break;

      case 'quiz_attempt':
        if (!lessonId || !quizData) {
          return NextResponse.json({ 
            success: false, 
            message: 'lessonId e quizData são obrigatórios para quiz' 
          }, { status: 400 });
        }
        const { score, maxScore, passed } = quizData;
        await progress.addQuizAttempt(lessonId, score, maxScore, passed);
        break;

      case 'pause_course':
        progress.status = 'paused';
        break;

      case 'resume_course':
        progress.status = 'in_progress';
        break;

      case 'issue_certificate':
        if (progress.progress === 100) {
          await progress.issueCertificate();
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Curso deve estar 100% completo para emitir certificado' 
          }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Ação inválida' 
        }, { status: 400 });
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Progresso atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json({ success: false, message: 'Erro ao atualizar progresso' }, { status: 500 });
  }
}
