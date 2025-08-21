import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware/auth';
import connectMongoDB from '@/lib/mongodb';
import Course, { ICourse } from '@/lib/models/Course';
import CourseProgress from '@/lib/models/CourseProgress';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const featured = searchParams.get('featured');
    
    // Construir filtros
    const filters: any = {
      status: 'published',
      isPublic: true
    };
    
    if (category) {
      filters.category = category;
    }
    
    if (level) {
      filters.level = level;
    }
    
    if (featured === 'true') {
      filters.isFeatured = true;
    }
    
    // Busca por texto
    if (search) {
      filters.$text = { $search: search };
    }
    
    // Configurar ordenação
    let sortConfig: any = {};
    switch (sort) {
      case 'popular':
        sortConfig = { 'metrics.popularityScore': -1, 'metrics.totalStudents': -1 };
        break;
      case 'rating':
        sortConfig = { 'metrics.averageRating': -1, 'metrics.totalReviews': -1 };
        break;
      case 'recent':
        sortConfig = { publishedAt: -1 };
        break;
      case 'title':
        sortConfig = { title: 1 };
        break;
      default:
        sortConfig = { 'metrics.popularityScore': -1 };
    }
    
    // Calcular paginação
    const skip = (page - 1) * limit;
    
    // Buscar cursos
    const courses = await Course.find(filters)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .select('title slug shortDescription thumbnail category level totalDuration totalLessons instructor pricing metrics isFeatured publishedAt')
      .lean();
    
    // Contar total para paginação
    const total = await Course.countDocuments(filters);
    const pages = Math.ceil(total / limit);
    
    // Se o usuário estiver logado, buscar progresso dos cursos
    let coursesWithProgress = courses;
    
    const user = await verifyAuth(request);
    if (user) {
      const userId = user._id;
      
      const courseIds = courses.map(course => course._id);
      const progressData = await CourseProgress.find({
        userId,
        courseId: { $in: courseIds }
      }).lean();
      
      // Mapear progresso para cada curso
      coursesWithProgress = courses.map(course => {
        const progress = progressData.find(p => p.courseId.toString() === (course._id as any).toString());
        return {
          ...course,
          userProgress: progress ? {
            status: progress.status,
            progress: progress.progress,
            lastAccessedAt: progress.lastAccessedAt
          } : null
        };
      });
    }
    
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
    console.error('Erro ao buscar cursos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    await connectMongoDB();
    
    const body = await request.json();
    
    // Gerar slug se não fornecido
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    // Verificar se slug já existe
    const existingCourse = await Course.findOne({ slug: body.slug });
    if (existingCourse) {
      body.slug = `${body.slug}-${Date.now()}`;
    }
    
    // Adicionar metadados
    body.createdBy = user._id;
    body.publishedAt = body.status === 'published' ? new Date() : undefined;
    
    const course = new Course(body);
    await course.save();
    
    return NextResponse.json({
      success: true,
      data: course
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
