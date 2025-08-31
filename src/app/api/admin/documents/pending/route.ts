import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import User from '@/lib/models/User';
import { verifyAdminAuth } from '@/lib/middleware/auth';

// GET - Listar documentos pendentes de aprovação
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'pending';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    // Construir filtros
    const filters: any = {};
    
    if (status === 'all') {
      filters.status = { $in: ['pending', 'under_review', 'rejected'] };
    } else {
      filters.status = status;
    }

    if (type && type !== 'all') {
      filters.type = type;
    }

    if (priority && priority !== 'all') {
      filters.priority = priority;
    }

    console.log('🔍 Filtros aplicados:', filters);

    // Buscar documentos com paginação
    const skip = (page - 1) * limit;
    
    const [documents, total] = await Promise.all([
      CandidateDocument.find(filters)
        .populate('candidateId', 'name email profile.phone')
        .populate('verifiedBy', 'name email')
        .sort({ 
          priority: -1, // Alta prioridade primeiro
          createdAt: -1 
        })
        .skip(skip)
        .limit(limit),
      CandidateDocument.countDocuments(filters)
    ]);

    // Estatísticas
    const stats = await CandidateDocument.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📄 Encontrados ${documents.length} documentos de ${total} total`);

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          pending: statusStats.pending || 0,
          under_review: statusStats.under_review || 0,
          verified: statusStats.verified || 0,
          rejected: statusStats.rejected || 0,
          total: total
        }
      },
      message: `${documents.length} documento(s) encontrado(s)`
    });
  } catch (error) {
    console.error('Erro ao buscar documentos pendentes:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar documentos pendentes' }, { status: 500 });
  }
}
