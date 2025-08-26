import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import CandidateDocument from '@/lib/models/CandidateDocument';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/middleware/auth';

// GET - Download direto do arquivo
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

    // Verificar se o usuário tem permissão para acessar o documento
    if (user.type !== 'admin' && user._id.toString() !== resolvedParams.id) {
      return NextResponse.json({ success: false, message: 'Acesso negado ao documento' }, { status: 403 });
    }

    // Buscar o documento específico
    const document = await CandidateDocument.findById(resolvedParams.documentId);
    if (!document || document.candidateId.toString() !== resolvedParams.id) {
      return NextResponse.json({ success: false, message: 'Documento não encontrado' }, { status: 404 });
    }

    // Verificar se o arquivo existe
    if (!document.fileUrl) {
      return NextResponse.json({ success: false, message: 'Arquivo não encontrado' }, { status: 404 });
    }

    // Determinar o tipo MIME correto baseado na extensão
    let mimeType = document.mimeType;
    if (!mimeType) {
      const extension = document.fileName.split('.').pop()?.toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'txt': 'text/plain'
      };
      mimeType = mimeTypes[extension || ''] || 'application/octet-stream';
    }

    // Se for base64, converter para buffer
    if (document.fileUrl.startsWith('data:') || !document.fileUrl.startsWith('http')) {
      // É base64, converter para buffer
      const base64Data = document.fileUrl.includes(',') ? document.fileUrl.split(',')[1] : document.fileUrl;
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Configurar headers para download
      const headers = new Headers();
      headers.set('Content-Type', mimeType);
      headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);
      headers.set('Content-Length', buffer.length.toString());
      
      return new NextResponse(buffer, {
        status: 200,
        headers
      });
    } else {
      // É uma URL externa, redirecionar
      return NextResponse.redirect(document.fileUrl);
    }

  } catch (error) {
    console.error('Erro ao fazer download do documento:', error);
    return NextResponse.json({ success: false, message: 'Erro ao fazer download' }, { status: 500 });
  }
}
