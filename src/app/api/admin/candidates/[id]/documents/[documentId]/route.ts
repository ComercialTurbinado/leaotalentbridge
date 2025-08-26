import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Visualizar/Download documento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    }

    const resolvedParams = await params;
    await connectMongoDB();

    // Verificar se o candidato existe
    const candidate = await User.findById(resolvedParams.id);
    if (!candidate || candidate.type !== 'candidato') {
      return NextResponse.json({ success: false, message: 'Candidato não encontrado' }, { status: 404 });
    }

    // Buscar o documento específico
    const document = await CandidateDocument.findById(resolvedParams.documentId);
    if (!document || document.candidateId.toString() !== resolvedParams.id) {
      return NextResponse.json({ success: false, message: 'Documento não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para acessar o documento
    if (user.type !== 'admin' && user._id.toString() !== resolvedParams.id) {
      return NextResponse.json({ success: false, message: 'Acesso negado ao documento' }, { status: 403 });
    }

    // Retornar dados do documento
    return NextResponse.json({
      success: true,
      data: {
        _id: document._id,
        type: document.type,
        fileType: document.fileType,
        title: document.title,
        description: document.description,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        status: document.status,
        uploadedBy: document.uploadedBy,
        createdAt: document.createdAt,
        verifiedAt: document.verifiedAt,
        adminComments: document.adminComments
      },
      message: 'Documento encontrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao buscar documento' }, { status: 500 });
  }
}
