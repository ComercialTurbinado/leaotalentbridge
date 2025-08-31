import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import { verifyAdminAuth } from '@/lib/middleware/auth';

// POST - Rejeitar documento
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

    const { reason, comments } = await request.json();

    if (!reason) {
      return NextResponse.json({ 
        success: false, 
        message: 'Motivo da rejeição é obrigatório' 
      }, { status: 400 });
    }

    // Buscar o documento
    const document = await CandidateDocument.findById(resolvedParams.documentId);
    if (!document) {
      return NextResponse.json({ success: false, message: 'Documento não encontrado' }, { status: 404 });
    }

    // Atualizar status para rejeitado
    document.status = 'rejected';
    document.verifiedBy = admin._id;
    document.verifiedAt = new Date();
    document.rejectionReason = reason;
    if (comments) {
      document.adminComments = comments;
    }

    await document.save();

    console.log(`❌ Documento ${resolvedParams.documentId} rejeitado por admin ${admin._id}. Motivo: ${reason}`);

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Documento rejeitado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao rejeitar documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao rejeitar documento' }, { status: 500 });
  }
}
