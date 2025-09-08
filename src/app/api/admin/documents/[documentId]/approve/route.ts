import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import { verifyAdminAuth } from '@/lib/middleware/auth';

// POST - Aprovar documento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    const { comments } = await request.json();

    // Buscar o documento
    const document = await CandidateDocument.findById(resolvedParams.documentId);
    if (!document) {
      return NextResponse.json({ success: false, message: 'Documento não encontrado' }, { status: 404 });
    }

    // Atualizar status para aprovado
    document.status = 'verified';
    document.verifiedBy = admin._id;
    document.verifiedAt = new Date();
    if (comments) {
      document.adminComments = comments;
    }

    await document.save();

    console.log(`✅ Documento ${resolvedParams.documentId} aprovado por admin ${admin._id}`);

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Documento aprovado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao aprovar documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao aprovar documento' }, { status: 500 });
  }
}
