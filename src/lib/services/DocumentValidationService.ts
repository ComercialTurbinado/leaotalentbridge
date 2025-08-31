import { ICandidateDocument } from '@/lib/models/CandidateDocument';

export interface ValidationResult {
  fileIntegrity: boolean;
  formatValid: boolean;
  sizeValid: boolean;
  contentValid?: boolean;
  errors: string[];
  warnings: string[];
}

export class DocumentValidationService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'text/plain'
  ];

  private static readonly REQUIRED_DOCUMENT_TYPES = [
    'cv',
    'passport',
    'diploma'
  ];

  /**
   * Valida um documento baseado em critérios técnicos e de negócio
   */
  static async validateDocument(document: Partial<ICandidateDocument>): Promise<ValidationResult> {
    const result: ValidationResult = {
      fileIntegrity: false,
      formatValid: false,
      sizeValid: false,
      contentValid: false,
      errors: [],
      warnings: []
    };

    // 1. Validação de integridade do arquivo
    result.fileIntegrity = this.validateFileIntegrity(document);
    if (!result.fileIntegrity) {
      result.errors.push('Arquivo corrompido ou inválido');
    }

    // 2. Validação de formato
    result.formatValid = this.validateFileFormat(document);
    if (!result.formatValid) {
      result.errors.push(`Formato de arquivo não suportado. Formatos aceitos: ${this.ALLOWED_MIME_TYPES.join(', ')}`);
    }

    // 3. Validação de tamanho
    result.sizeValid = this.validateFileSize(document);
    if (!result.sizeValid) {
      result.errors.push(`Arquivo muito grande. Tamanho máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // 4. Validação de conteúdo (básica)
    result.contentValid = await this.validateContent(document);
    if (!result.contentValid) {
      result.warnings.push('Conteúdo do documento pode precisar de revisão manual');
    }

    // 5. Validações específicas por tipo de documento
    this.validateDocumentTypeSpecific(document, result);

    return result;
  }

  /**
   * Valida a integridade básica do arquivo
   */
  private static validateFileIntegrity(document: Partial<ICandidateDocument>): boolean {
    if (!document.fileUrl || !document.fileName || !document.mimeType) {
      return false;
    }

    // Verificar se o arquivo tem conteúdo válido (Base64 ou URL)
    if (document.fileUrl.startsWith('data:')) {
      // Arquivo Base64
      const base64Data = document.fileUrl.split(',')[1];
      return Boolean(base64Data && base64Data.length > 0);
    } else {
      // URL de arquivo
      return document.fileUrl.length > 0;
    }
  }

  /**
   * Valida o formato do arquivo
   */
  private static validateFileFormat(document: Partial<ICandidateDocument>): boolean {
    if (!document.mimeType) return false;
    return this.ALLOWED_MIME_TYPES.includes(document.mimeType);
  }

  /**
   * Valida o tamanho do arquivo
   */
  private static validateFileSize(document: Partial<ICandidateDocument>): boolean {
    if (!document.fileSize) return false;
    return document.fileSize <= this.MAX_FILE_SIZE;
  }

  /**
   * Validação básica de conteúdo
   */
  private static async validateContent(document: Partial<ICandidateDocument>): Promise<boolean> {
    // Validações básicas de conteúdo
    if (!document.title || document.title.trim().length < 3) {
      return false;
    }

    // Para PDFs, verificar se não está vazio
    if (document.mimeType === 'application/pdf' && (document.fileSize || 0) < 1000) {
      return false;
    }

    // Para imagens, verificar se não está corrompida
    if (document.mimeType?.startsWith('image/') && (document.fileSize || 0) < 100) {
      return false;
    }

    return true;
  }

  /**
   * Validações específicas por tipo de documento
   */
  private static validateDocumentTypeSpecific(
    document: Partial<ICandidateDocument>, 
    result: ValidationResult
  ): void {
    if (!document.type) return;

    switch (document.type) {
      case 'cv':
        this.validateCV(document, result);
        break;
      case 'passport':
        this.validatePassport(document, result);
        break;
      case 'diploma':
        this.validateDiploma(document, result);
        break;
      case 'visa':
        this.validateVisa(document, result);
        break;
      case 'certificate':
        this.validateCertificate(document, result);
        break;
    }
  }

  /**
   * Validações específicas para CV
   */
  private static validateCV(document: Partial<ICandidateDocument>, result: ValidationResult): void {
    // CV deve ser PDF ou DOC
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(document.mimeType || '')) {
      result.errors.push('CV deve ser um arquivo PDF ou DOC');
    }

    // CV deve ter um tamanho mínimo
    if (document.fileSize && document.fileSize < 5000) {
      result.warnings.push('CV parece muito pequeno, verifique se está completo');
    }
  }

  /**
   * Validações específicas para passaporte
   */
  private static validatePassport(document: Partial<ICandidateDocument>, result: ValidationResult): void {
    // Passaporte deve ser uma imagem
    if (!document.mimeType?.startsWith('image/')) {
      result.errors.push('Passaporte deve ser uma imagem (JPG, PNG)');
    }

    // Verificar se o título contém informações relevantes
    if (document.title && !document.title.toLowerCase().includes('passaporte')) {
      result.warnings.push('Considere incluir "Passaporte" no título do documento');
    }
  }

  /**
   * Validações específicas para diploma
   */
  private static validateDiploma(document: Partial<ICandidateDocument>, result: ValidationResult): void {
    // Diploma deve ser PDF ou imagem
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(document.mimeType || '')) {
      result.errors.push('Diploma deve ser um arquivo PDF ou imagem');
    }

    // Verificar se o título contém informações relevantes
    if (document.title && !document.title.toLowerCase().includes('diploma')) {
      result.warnings.push('Considere incluir "Diploma" no título do documento');
    }
  }

  /**
   * Validações específicas para visto
   */
  private static validateVisa(document: Partial<ICandidateDocument>, result: ValidationResult): void {
    // Visto deve ser uma imagem ou PDF
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(document.mimeType || '')) {
      result.errors.push('Visto deve ser um arquivo PDF ou imagem');
    }
  }

  /**
   * Validações específicas para certificado
   */
  private static validateCertificate(document: Partial<ICandidateDocument>, result: ValidationResult): void {
    // Certificado deve ser PDF ou imagem
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(document.mimeType || '')) {
      result.errors.push('Certificado deve ser um arquivo PDF ou imagem');
    }
  }

  /**
   * Determina a prioridade do documento baseado no tipo
   */
  static getDocumentPriority(type: string): 'low' | 'medium' | 'high' {
    const highPriority = ['cv', 'passport', 'diploma'];
    const mediumPriority = ['visa', 'certificate'];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  }

  /**
   * Verifica se um documento é obrigatório
   */
  static isRequiredDocument(type: string): boolean {
    return this.REQUIRED_DOCUMENT_TYPES.includes(type);
  }

  /**
   * Gera um relatório de validação
   */
  static generateValidationReport(result: ValidationResult): string {
    let report = '';

    if (result.errors.length > 0) {
      report += '❌ ERROS ENCONTRADOS:\n';
      result.errors.forEach(error => {
        report += `• ${error}\n`;
      });
    }

    if (result.warnings.length > 0) {
      report += '\n⚠️ AVISOS:\n';
      result.warnings.forEach(warning => {
        report += `• ${warning}\n`;
      });
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      report = '✅ Documento validado com sucesso!';
    }

    return report;
  }
}
