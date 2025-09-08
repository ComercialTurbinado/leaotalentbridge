`import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  'pt-BR': {
    translation: {
      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Bem-vindo ao UAE Careers',
      'dashboard.applications': 'Candidaturas',
      'dashboard.documents': 'Documentos',
      'dashboard.interviews': 'Entrevistas',
      'dashboard.profile': 'Perfil',
      'dashboard.overview': 'Visão Geral',
      'dashboard.connections': 'Conexões',
      'dashboard.evaluations': 'Avaliações',
      'dashboard.timeline': 'Timeline',
      
      // Botões
      'button.save': 'Salvar',
      'button.cancel': 'Cancelar',
      'button.edit': 'Editar',
      'button.delete': 'Excluir',
      'button.send': 'Enviar',
      'button.upload': 'Enviar',
      'button.download': 'Download',
      'button.view': 'Visualizar',
      'button.add': 'Adicionar',
      'button.create': 'Criar',
      'button.back': 'Voltar',
      'button.next': 'Próximo',
      'button.previous': 'Anterior',
      'button.close': 'Fechar',
      'button.confirm': 'Confirmar',
      'button.approve': 'Aprovar',
      'button.reject': 'Rejeitar',
      
      // Formulários
      'form.name': 'Nome',
      'form.email': 'E-mail',
      'form.phone': 'Telefone',
      'form.company': 'Empresa',
      'form.position': 'Cargo',
      'form.password': 'Senha',
      'form.confirmPassword': 'Confirmar Senha',
      'form.description': 'Descrição',
      'form.title': 'Título',
      'form.type': 'Tipo',
      'form.status': 'Status',
      'form.date': 'Data',
      'form.time': 'Hora',
      'form.duration': 'Duração',
      'form.location': 'Local',
      'form.notes': 'Observações',
      'form.required': 'Campo obrigatório',
      
      // Status
      'status.pending': 'Pendente',
      'status.approved': 'Aprovado',
      'status.rejected': 'Rejeitado',
      'status.suspended': 'Suspenso',
      'status.verified': 'Verificado',
      'status.notVerified': 'Não verificado',
      'status.scheduled': 'Agendada',
      'status.completed': 'Concluída',
      'status.cancelled': 'Cancelada',
      'status.noShow': 'Não Compareceu',
      
      // Mensagens
      'message.success': 'Operação realizada com sucesso!',
      'message.error': 'Erro ao realizar operação',
      'message.confirmDelete': 'Tem certeza que deseja excluir?',
      'message.confirmAction': 'Tem certeza que deseja realizar esta ação?',
      'message.loading': 'Carregando...',
      'message.saving': 'Salvando...',
      'message.sending': 'Enviando...',
      'message.uploading': 'Enviando...',
      
      // Tabelas
      'table.noData': 'Nenhum dado encontrado',
      'table.loading': 'Carregando dados...',
      'table.actions': 'Ações',
      'table.search': 'Buscar',
      'table.filter': 'Filtrar',
      'table.pagination': 'Paginação',
      
      // Modais
      'modal.confirm': 'Confirmar',
      'modal.cancel': 'Cancelar',
      'modal.close': 'Fechar',
      'modal.save': 'Salvar',
      'modal.create': 'Criar',
      'modal.edit': 'Editar',
      'modal.delete': 'Excluir',
      
      // Tipos de documento
      'document.type.cv': 'Currículo',
      'document.type.certificate': 'Certificado',
      'document.type.contract': 'Contrato',
      'document.type.form': 'Formulário',
      'document.type.other': 'Outro',
      
      // Tipos de entrevista
      'interview.type.online': 'Online',
      'interview.type.presential': 'Presencial',
      'interview.type.phone': 'Telefone',
      
      // Permissões
      'permission.accessJobs': 'Acessar Vagas',
      'permission.applyToJobs': 'Candidatar-se',
      'permission.viewCourses': 'Ver Cursos',
      'permission.accessSimulations': 'Simulações',
      'permission.contactCompanies': 'Contatar Empresas',
      
      // Verificações
      'verification.profile': 'Perfil Verificado',
      'verification.documents': 'Documentos Verificados',
      'verification.company': 'Empresa Verificada',
      
      // Tempo
      'time.minutes': 'minutos',
      'time.hours': 'horas',
      'time.days': 'dias',
      'time.weeks': 'semanas',
      'time.months': 'meses',
      'time.years': 'anos',
      
      // Prioridades
      'priority.low': 'Baixa',
      'priority.medium': 'Média',
      'priority.high': 'Alta',
      
      // Mensagens específicas
      'message.interviewScheduled': 'Entrevista agendada com sucesso!',
      'message.documentUploaded': 'Documento enviado com sucesso!',
      'message.messageSent': 'Mensagem enviada com sucesso!',
      'message.candidateDeleted': 'Candidato excluído com sucesso!',
      'message.candidateCreated': 'Candidato criado com sucesso!',
      'message.candidateUpdated': 'Candidato atualizado com sucesso!',
      
      // Erros
      'error.loadingData': 'Erro ao carregar dados',
      'error.savingData': 'Erro ao salvar dados',
      'error.uploadingFile': 'Erro ao enviar arquivo',
      'error.invalidFile': 'Arquivo inválido',
      'error.fileTooLarge': 'Arquivo muito grande',
      'error.requiredFields': 'Por favor, preencha todos os campos obrigatórios',
      
      // Placeholders
      'placeholder.search': 'Buscar...',
      'placeholder.selectOption': 'Selecione uma opção',
      'placeholder.enterText': 'Digite aqui...',
      'placeholder.enterEmail': 'Digite seu e-mail',
      'placeholder.enterPhone': 'Digite seu telefone',
      'placeholder.enterName': 'Digite seu nome',
      'placeholder.enterCompany': 'Digite o nome da empresa',
      'placeholder.enterPosition': 'Digite o cargo',
      
      // Labels
      'label.all': 'Todos',
      'label.yes': 'Sim',
      'label.no': 'Não',
      'label.optional': 'Opcional',
      'label.required': 'Obrigatório',
      'label.file': 'Arquivo',
      'label.fileSize': 'Tamanho do arquivo',
      'label.fileType': 'Tipo do arquivo',
      'label.uploadedBy': 'Enviado por',
      'label.uploadDate': 'Data de envio',
      'label.interviewer': 'Entrevistador',
      'label.meetingUrl': 'Link da reunião',
      'label.adminComments': 'Comentários do admin',
      
      // Títulos de seção
      'section.basicInfo': 'Informações Básicas',
      'section.professionalProfile': 'Perfil Profissional',
      'section.permissions': 'Permissões',
      'section.verification': 'Verificação',
      'section.documents': 'Documentos',
      'section.interviews': 'Entrevistas',
      'section.metrics': 'Métricas',
      'section.actions': 'Ações',
      
      // Navegação
      'nav.dashboard': 'Dashboard',
      'nav.candidates': 'Candidatos',
      'nav.companies': 'Empresas',
      'nav.jobs': 'Vagas',
      'nav.courses': 'Cursos',
      'nav.simulations': 'Simulações',
      'nav.settings': 'Configurações',
      'nav.profile': 'Perfil',
      'nav.logout': 'Sair',
      
      // Homepage
      'home.hero.title': 'Seu talento reconhecido no mundo.',
      'home.hero.description': 'Conectamos profissionais brasileiros às melhores oportunidades nos Emirados Árabes Unidos. Somos a ponte entre profissionais qualificados e empresas que valorizam a excelência. Com base em Dubai, conectamos talentos brasileiros ao futuro que eles merecem.',
      'home.hero.cta': 'Saiba mais',
      'home.hero.startJourney': 'Comece Sua Jornada',
      'home.hero.candidate': 'Sou Candidato',
      'home.hero.company': 'Sou Empresa',
      'home.hero.stats': '500+ Profissionais Conectados',
      'home.hero.fullName': 'Nome Completo',
      'home.hero.email': 'E-mail',
      'home.hero.phone': 'Telefone',
      'home.hero.linkedin': 'LinkedIn',
      'home.hero.website': 'Website',
      'home.hero.companyLinkedin': 'LinkedIn da Empresa',
      'home.hero.experience': 'Nível de Experiência',
      'home.hero.companyName': 'Nome da Empresa',
      'home.hero.experienceLevels.junior': 'Júnior (1-3 anos)',
      'home.hero.experienceLevels.pleno': 'Pleno (3-7 anos)',
      'home.hero.experienceLevels.senior': 'Sênior (7+ anos)',
      'home.hero.experienceLevels.managerial': 'Gerencial/Executivo',
      'home.hero.startRegistration': 'Iniciar Cadastro',
      'home.hero.alreadyHaveAccount': 'Já tem uma conta?',
      'home.hero.login': 'Fazer Login',
      'home.hero.select': 'Selecione',
      'home.hero.placeholders.fullName': 'Digite seu nome completo',
      'home.hero.placeholders.email': 'seu@email.com',
      'home.hero.placeholders.phone': '+55 (11) 99999-9999',
      'home.hero.placeholders.linkedin': 'https://www.linkedin.com/in/seu-perfil',
      'home.hero.placeholders.website': 'https://www.seuwebsite.com',
      'home.hero.placeholders.companyLinkedin': 'https://www.linkedin.com/company/empresa',
      'home.hero.placeholders.companyName': 'Nome da sua empresa',
      
      // How it works
      'home.howItWorks.title': 'Comece Sua Jornada',
      'home.howItWorks.subtitle': 'Um Processo Simples E Eficiente Para Conectar Talentos A Oportunidades Únicas',
      'home.howItWorks.step1.title': 'Crie Seu Perfil',
      'home.howItWorks.step1.description': 'Complete seu perfil com experiências, competências e objetivos.',
      'home.howItWorks.step2.title': 'Conexão Inteligente',
      'home.howItWorks.step2.description': 'Nossa plataforma cruza seus dados com vagas exclusivas que realmente combinam com seu talento.',
      'home.howItWorks.step3.title': 'Seleção com Propósito',
      'home.howItWorks.step3.description': 'Participe de processos seletivos com empresas que valorizam o profissional brasileiro.',
      'home.howItWorks.step4.title': 'Transição Estruturada',
      'home.howItWorks.step4.description': 'Receba orientação jurídica e profissional, com suporte cultural.',
      
      // Benefits
      'home.benefits.title': 'Por que Escolher a UAE Careers?',
      'home.benefits.subtitle': 'Oferecemos Muito Mais Que Simples Conexões - Somos Seu Parceiro De Sucesso',
      'home.benefits.exclusive.title': 'Oportunidades Exclusivas',
      'home.benefits.exclusive.description': 'Vagas que você não encontra no LinkedIn — Acesso direto a oportunidades confidenciais com empresas selecionadas nos Emirados.',
      'home.benefits.secure.title': 'Processo Seguro',
      'home.benefits.secure.description': 'Empresas verificadas e confiáveis — Você participa apenas de processos com empregadores sérios inclusive recomendado pela MOHRE.',
      'home.benefits.support.title': 'Suporte Completo',
      'home.benefits.support.description': 'Apoio antes, durante e depois da mudança — Não é só sobre conseguir a vaga. Nós garantimos que sua chegada seja tranquila.',
      
      // About
      'home.about.title': 'Sobre a UAE Careers',
      'home.about.subtitle': 'Conectando Talentos Ao Futuro',
      'home.about.description1': 'A partir de uma escuta ativa das demandas do mercado dos Emirados Árabes Unidos — e com o respaldo de líderes empresariais e apoio institucional — nasceu a UAE Careers, com um propósito claro: criar oportunidades reais para brasileiros no cenário internacional, com foco em todos os Emirados.',
      'home.about.description2': 'Aliamos o conhecimento das necessidades das empresas locais aos objetivos e competências dos profissionais que desejam atuar fora do Brasil.',
      'home.about.highlight': 'Como uma vertente da Leão Group Global, a UAE Careers se destaca pela sólida experiência na mobilidade e recolocação de talentos, sendo amplamente reconhecida nos Emirados Árabes por sua atuação estratégica e comprometida.',
      
      // Contact
      'home.contact.title': 'Entre em Contato',
      'home.contact.subtitle': 'Pronto Para Dar O Próximo Passo? Nossa Equipe Está Aqui Para Ajudar',
      'home.contact.email.title': 'E-mail',
      'home.contact.email.address': 'contato@leaocareers.com',
      'home.contact.email.cta': 'Fale Com Um Consultor',
      'home.contact.phone.title': 'Telefone',
      'home.contact.phone.number': '+971 50 371 6967',
      'home.contact.phone.cta': 'Tirar Dúvidas Agora',
      'home.contact.location.title': 'Unidades',
      'home.contact.location.address': 'Rio de Janeiro, Brasil<br />Dubai, EAU',
      'home.contact.location.cta': 'Ver Localização',
      
      // Footer
      'home.footer.copyright': '© 2024 UAE Careers. Todos os direitos reservados.',
      
      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.description': 'Acompanhe suas candidaturas, documentos e oportunidades de carreira',
      'dashboard.lastUpdate': 'Última atualização',
      'dashboard.refresh': 'Atualizar',
      'dashboard.refreshing': 'Atualizando...',
      'dashboard.tryAgain': 'Tentar novamente',
      'dashboard.totalApplications': 'Total de Candidaturas',
      'dashboard.upcoming': 'Próximas',
      'dashboard.profile': 'Perfil',
      'dashboard.documents': 'Documentos',
      'dashboard.completion': 'Completude',
      'dashboard.verified': 'Verificados',
      'dashboard.upcomingInterviews': 'Próximas Entrevistas',
      'dashboard.profileComplete': 'Perfil Completo',
      'dashboard.pendingDocuments': 'Documentos Pendentes',
      'dashboard.completedSimulations': 'Simulações Concluídas',
      'dashboard.activeAndHistorical': 'Ativas e históricas',
      'dashboard.scheduled': 'Agendadas',
      'dashboard.currentProgress': 'Progresso atual',
      'dashboard.verifiedOf': 'verificados',
      'dashboard.completed': 'Concluídas'
    }
  },
  'en': {
    translation: {
      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.welcome': 'Welcome to UAE Careers',
      'dashboard.applications': 'Applications',
      'dashboard.documents': 'Documents',
      'dashboard.interviews': 'Interviews',
      'dashboard.profile': 'Profile',
      'dashboard.overview': 'Overview',
      'dashboard.connections': 'Connections',
      'dashboard.evaluations': 'Evaluations',
      'dashboard.timeline': 'Timeline',
      
      // Buttons
      'button.save': 'Save',
      'button.cancel': 'Cancel',
      'button.edit': 'Edit',
      'button.delete': 'Delete',
      'button.send': 'Send',
      'button.upload': 'Upload',
      'button.download': 'Download',
      'button.view': 'View',
      'button.add': 'Add',
      'button.create': 'Create',
      'button.back': 'Back',
      'button.next': 'Next',
      'button.previous': 'Previous',
      'button.close': 'Close',
      'button.confirm': 'Confirm',
      'button.approve': 'Approve',
      'button.reject': 'Reject',
      
      // Forms
      'form.name': 'Name',
      'form.email': 'Email',
      'form.phone': 'Phone',
      'form.company': 'Company',
      'form.position': 'Position',
      'form.password': 'Password',
      'form.confirmPassword': 'Confirm Password',
      'form.description': 'Description',
      'form.title': 'Title',
      'form.type': 'Type',
      'form.status': 'Status',
      'form.date': 'Date',
      'form.time': 'Time',
      'form.duration': 'Duration',
      'form.location': 'Location',
      'form.notes': 'Notes',
      'form.required': 'Required field',
      
      // Status
      'status.pending': 'Pending',
      'status.approved': 'Approved',
      'status.rejected': 'Rejected',
      'status.suspended': 'Suspended',
      'status.verified': 'Verified',
      'status.notVerified': 'Not verified',
      'status.scheduled': 'Scheduled',
      'status.completed': 'Completed',
      'status.cancelled': 'Cancelled',
      'status.noShow': 'No Show',
      
      // Messages
      'message.success': 'Operation completed successfully!',
      'message.error': 'Error performing operation',
      'message.confirmDelete': 'Are you sure you want to delete?',
      'message.confirmAction': 'Are you sure you want to perform this action?',
      'message.loading': 'Loading...',
      'message.saving': 'Saving...',
      'message.sending': 'Sending...',
      'message.uploading': 'Uploading...',
      
      // Tables
      'table.noData': 'No data found',
      'table.loading': 'Loading data...',
      'table.actions': 'Actions',
      'table.search': 'Search',
      'table.filter': 'Filter',
      'table.pagination': 'Pagination',
      
      // Modals
      'modal.confirm': 'Confirm',
      'modal.cancel': 'Cancel',
      'modal.close': 'Close',
      'modal.save': 'Save',
      'modal.create': 'Create',
      'modal.edit': 'Edit',
      'modal.delete': 'Delete',
      
      // Document types
      'document.type.cv': 'Resume',
      'document.type.certificate': 'Certificate',
      'document.type.contract': 'Contract',
      'document.type.form': 'Form',
      'document.type.other': 'Other',
      
      // Interview types
      'interview.type.online': 'Online',
      'interview.type.presential': 'In-person',
      'interview.type.phone': 'Phone',
      
      // Permissions
      'permission.accessJobs': 'Access Jobs',
      'permission.applyToJobs': 'Apply to Jobs',
      'permission.viewCourses': 'View Courses',
      'permission.accessSimulations': 'Simulations',
      'permission.contactCompanies': 'Contact Companies',
      
      // Verifications
      'verification.profile': 'Profile Verified',
      'verification.documents': 'Documents Verified',
      'verification.company': 'Company Verified',
      
      // Time
      'time.minutes': 'minutes',
      'time.hours': 'hours',
      'time.days': 'days',
      'time.weeks': 'weeks',
      'time.months': 'months',
      'time.years': 'years',
      
      // Priorities
      'priority.low': 'Low',
      'priority.medium': 'Medium',
      'priority.high': 'High',
      
      // Specific messages
      'message.interviewScheduled': 'Interview scheduled successfully!',
      'message.documentUploaded': 'Document uploaded successfully!',
      'message.messageSent': 'Message sent successfully!',
      'message.candidateDeleted': 'Candidate deleted successfully!',
      'message.candidateCreated': 'Candidate created successfully!',
      'message.candidateUpdated': 'Candidate updated successfully!',
      
      // Errors
      'error.loadingData': 'Error loading data',
      'error.savingData': 'Error saving data',
      'error.uploadingFile': 'Error uploading file',
      'error.invalidFile': 'Invalid file',
      'error.fileTooLarge': 'File too large',
      'error.requiredFields': 'Please fill in all required fields',
      
      // Placeholders
      'placeholder.search': 'Search...',
      'placeholder.selectOption': 'Select an option',
      'placeholder.enterText': 'Enter text here...',
      'placeholder.enterEmail': 'Enter your email',
      'placeholder.enterPhone': 'Enter your phone',
      'placeholder.enterName': 'Enter your name',
      'placeholder.enterCompany': 'Enter company name',
      'placeholder.enterPosition': 'Enter position',
      
      // Labels
      'label.all': 'All',
      'label.yes': 'Yes',
      'label.no': 'No',
      'label.optional': 'Optional',
      'label.required': 'Required',
      'label.file': 'File',
      'label.fileSize': 'File size',
      'label.fileType': 'File type',
      'label.uploadedBy': 'Uploaded by',
      'label.uploadDate': 'Upload date',
      'label.interviewer': 'Interviewer',
      'label.meetingUrl': 'Meeting URL',
      'label.adminComments': 'Admin comments',
      
      // Section titles
      'section.basicInfo': 'Basic Information',
      'section.professionalProfile': 'Professional Profile',
      'section.permissions': 'Permissions',
      'section.verification': 'Verification',
      'section.documents': 'Documents',
      'section.interviews': 'Interviews',
      'section.metrics': 'Metrics',
      'section.actions': 'Actions',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.candidates': 'Candidates',
      'nav.companies': 'Companies',
      'nav.jobs': 'Jobs',
      'nav.courses': 'Courses',
      'nav.simulations': 'Simulations',
      'nav.settings': 'Settings',
      'nav.profile': 'Profile',
      'nav.logout': 'Logout',
      
      // Homepage
      'home.hero.title': 'Your talent recognized worldwide.',
      'home.hero.description': 'We connect Brazilian professionals to the best opportunities in the United Arab Emirates. We are the bridge between qualified professionals and companies that value excellence. Based in Dubai, we connect Brazilian talents to the future they deserve.',
      'home.hero.cta': 'Learn more',
      'home.hero.startJourney': 'Start Your Journey',
      'home.hero.candidate': 'I am a Candidate',
      'home.hero.company': 'I am a Company',
      'home.hero.stats': '500+ Professionals Connected',
      'home.hero.fullName': 'Full Name',
      'home.hero.email': 'Email',
      'home.hero.phone': 'Phone',
      'home.hero.linkedin': 'LinkedIn',
      'home.hero.website': 'Website',
      'home.hero.companyLinkedin': 'Company LinkedIn',
      'home.hero.experience': 'Experience Level',
      'home.hero.companyName': 'Company Name',
      'home.hero.experienceLevels.junior': 'Junior (1-3 years)',
      'home.hero.experienceLevels.pleno': 'Mid-level (3-7 years)',
      'home.hero.experienceLevels.senior': 'Senior (7+ years)',
      'home.hero.experienceLevels.managerial': 'Managerial/Executive',
      'home.hero.startRegistration': 'Start Registration',
      'home.hero.alreadyHaveAccount': 'Already have an account?',
      'home.hero.login': 'Login',
      'home.hero.select': 'Select',
      'home.hero.placeholders.fullName': 'Enter your full name',
      'home.hero.placeholders.email': 'your@email.com',
      'home.hero.placeholders.phone': '+55 (11) 99999-9999',
      'home.hero.placeholders.linkedin': 'https://www.linkedin.com/in/your-profile',
      'home.hero.placeholders.website': 'https://www.yourwebsite.com',
      'home.hero.placeholders.companyLinkedin': 'https://www.linkedin.com/company/company',
      'home.hero.placeholders.companyName': 'Your company name',
      
      // How it works
      'home.howItWorks.title': 'Start Your Journey',
      'home.howItWorks.subtitle': 'A Simple And Efficient Process To Connect Talents To Unique Opportunities',
      'home.howItWorks.step1.title': 'Create Your Profile',
      'home.howItWorks.step1.description': 'Complete your profile with experiences, skills and objectives.',
      'home.howItWorks.step2.title': 'Smart Connection',
      'home.howItWorks.step2.description': 'Our platform matches your data with exclusive positions that really match your talent.',
      'home.howItWorks.step3.title': 'Purposeful Selection',
      'home.howItWorks.step3.description': 'Participate in selection processes with companies that value Brazilian professionals.',
      'home.howItWorks.step4.title': 'Structured Transition',
      'home.howItWorks.step4.description': 'Receive legal and professional guidance, with cultural support.',
      
      // Benefits
      'home.benefits.title': 'Why Choose UAE Careers?',
      'home.benefits.subtitle': 'We Offer Much More Than Simple Connections - We Are Your Success Partner',
      'home.benefits.exclusive.title': 'Exclusive Opportunities',
      'home.benefits.exclusive.description': 'Positions you won\'t find on LinkedIn — Direct access to confidential opportunities with selected companies in the Emirates.',
      'home.benefits.secure.title': 'Secure Process',
      'home.benefits.secure.description': 'Verified and reliable companies — You only participate in processes with serious employers including those recommended by MOHRE.',
      'home.benefits.support.title': 'Complete Support',
      'home.benefits.support.description': 'Support before, during and after the move — It\'s not just about getting the job. We ensure your arrival is smooth.',
      
      // About
      'home.about.title': 'About UAE Careers',
      'home.about.subtitle': 'Connecting Talents To The Future',
      'home.about.description1': 'From an active listening to the demands of the United Arab Emirates market — and with the support of business leaders and institutional support — UAE Careers was born, with a clear purpose: to create real opportunities for Brazilians in the international scenario, focusing on all Emirates.',
      'home.about.description2': 'We combine knowledge of local companies\' needs with the objectives and skills of professionals who want to work outside Brazil.',
      'home.about.highlight': 'As a branch of Leão Group Global, UAE Careers stands out for its solid experience in talent mobility and relocation, being widely recognized in the United Arab Emirates for its strategic and committed performance.',
      
      // Contact
      'home.contact.title': 'Get in Touch',
      'home.contact.subtitle': 'Ready to Take the Next Step? Our Team is Here to Help',
      'home.contact.email.title': 'Email',
      'home.contact.email.address': 'contato@leaocareers.com',
      'home.contact.email.cta': 'Talk to a Consultant',
      'home.contact.phone.title': 'Phone',
      'home.contact.phone.number': '+971 50 371 6967',
      'home.contact.phone.cta': 'Ask Questions Now',
      'home.contact.location.title': 'Offices',
      'home.contact.location.address': 'Rio de Janeiro, Brazil<br />Dubai, UAE',
      'home.contact.location.cta': 'View Location',
      
      // Footer
      'home.footer.copyright': '© 2024 UAE Careers. All rights reserved.',
      
      // Dashboard
      'dashboard.title': 'Dashboard',
      'dashboard.description': 'Track your applications, documents and career opportunities',
      'dashboard.lastUpdate': 'Last update',
      'dashboard.refresh': 'Refresh',
      'dashboard.refreshing': 'Refreshing...',
      'dashboard.tryAgain': 'Try again',
      'dashboard.totalApplications': 'Total Applications',
      'dashboard.upcoming': 'Upcoming',
      'dashboard.profile': 'Profile',
      'dashboard.documents': 'Documents',
      'dashboard.completion': 'Completion',
      'dashboard.verified': 'Verified',
      'dashboard.upcomingInterviews': 'Upcoming Interviews',
      'dashboard.profileComplete': 'Profile Complete',
      'dashboard.pendingDocuments': 'Pending Documents',
      'dashboard.completedSimulations': 'Completed Simulations',
      'dashboard.activeAndHistorical': 'Active and historical',
      'dashboard.scheduled': 'Scheduled',
      'dashboard.currentProgress': 'Current progress',
      'dashboard.verifiedOf': 'verified',
      'dashboard.completed': 'Completed'
    }
  },
  'ar': {
    translation: {
      // Dashboard
      'dashboard.title': 'لوحة التحكم',
      'dashboard.welcome': 'مرحباً بك في وظائف الإمارات',
      'dashboard.applications': 'الطلبات',
      'dashboard.documents': 'المستندات',
      'dashboard.interviews': 'المقابلات',
      'dashboard.profile': 'الملف الشخصي',
      'dashboard.overview': 'نظرة عامة',
      'dashboard.connections': 'الصلات',
      'dashboard.evaluations': 'التقييمات',
      'dashboard.timeline': 'الجدول الزمني',
      
      // Buttons
      'button.save': 'حفظ',
      'button.cancel': 'إلغاء',
      'button.edit': 'تعديل',
      'button.delete': 'حذف',
      'button.send': 'إرسال',
      'button.upload': 'رفع',
      'button.download': 'تحميل',
      'button.view': 'عرض',
      'button.add': 'إضافة',
      'button.create': 'إنشاء',
      'button.back': 'رجوع',
      'button.next': 'التالي',
      'button.previous': 'السابق',
      'button.close': 'إغلاق',
      'button.confirm': 'تأكيد',
      'button.approve': 'موافقة',
      'button.reject': 'رفض',
      
      // Forms
      'form.name': 'الاسم',
      'form.email': 'البريد الإلكتروني',
      'form.phone': 'الهاتف',
      'form.company': 'الشركة',
      'form.position': 'المنصب',
      'form.password': 'كلمة المرور',
      'form.confirmPassword': 'تأكيد كلمة المرور',
      'form.description': 'الوصف',
      'form.title': 'العنوان',
      'form.type': 'النوع',
      'form.status': 'الحالة',
      'form.date': 'التاريخ',
      'form.time': 'الوقت',
      'form.duration': 'المدة',
      'form.location': 'الموقع',
      'form.notes': 'ملاحظات',
      'form.required': 'حقل مطلوب',
      
      // Status
      'status.pending': 'قيد الانتظار',
      'status.approved': 'موافق عليه',
      'status.rejected': 'مرفوض',
      'status.suspended': 'معلق',
      'status.verified': 'متحقق منه',
      'status.notVerified': 'غير متحقق منه',
      'status.scheduled': 'مجدول',
      'status.completed': 'مكتمل',
      'status.cancelled': 'ملغي',
      'status.noShow': 'لم يحضر',
      
      // Messages
      'message.success': 'تم إنجاز العملية بنجاح!',
      'message.error': 'خطأ في تنفيذ العملية',
      'message.confirmDelete': 'هل أنت متأكد من أنك تريد الحذف؟',
      'message.confirmAction': 'هل أنت متأكد من أنك تريد تنفيذ هذا الإجراء؟',
      'message.loading': 'جاري التحميل...',
      'message.saving': 'جاري الحفظ...',
      'message.sending': 'جاري الإرسال...',
      'message.uploading': 'جاري الرفع...',
      
      // Tables
      'table.noData': 'لا توجد بيانات',
      'table.loading': 'جاري تحميل البيانات...',
      'table.actions': 'الإجراءات',
      'table.search': 'بحث',
      'table.filter': 'تصفية',
      'table.pagination': 'ترقيم الصفحات',
      
      // Modals
      'modal.confirm': 'تأكيد',
      'modal.cancel': 'إلغاء',
      'modal.close': 'إغلاق',
      'modal.save': 'حفظ',
      'modal.create': 'إنشاء',
      'modal.edit': 'تعديل',
      'modal.delete': 'حذف',
      
      // Document types
      'document.type.cv': 'السيرة الذاتية',
      'document.type.certificate': 'شهادة',
      'document.type.contract': 'عقد',
      'document.type.form': 'نموذج',
      'document.type.other': 'أخرى',
      
      // Interview types
      'interview.type.online': 'عبر الإنترنت',
      'interview.type.presential': 'شخصياً',
      'interview.type.phone': 'هاتفياً',
      
      // Permissions
      'permission.accessJobs': 'الوصول إلى الوظائف',
      'permission.applyToJobs': 'التقديم للوظائف',
      'permission.viewCourses': 'عرض الدورات',
      'permission.accessSimulations': 'المحاكاة',
      'permission.contactCompanies': 'التواصل مع الشركات',
      
      // Verifications
      'verification.profile': 'الملف الشخصي متحقق منه',
      'verification.documents': 'المستندات متحقق منها',
      'verification.company': 'الشركة متحقق منها',
      
      // Time
      'time.minutes': 'دقائق',
      'time.hours': 'ساعات',
      'time.days': 'أيام',
      'time.weeks': 'أسابيع',
      'time.months': 'أشهر',
      'time.years': 'سنوات',
      
      // Priorities
      'priority.low': 'منخفضة',
      'priority.medium': 'متوسطة',
      'priority.high': 'عالية',
      
      // Specific messages
      'message.interviewScheduled': 'تم جدولة المقابلة بنجاح!',
      'message.documentUploaded': 'تم رفع المستند بنجاح!',
      'message.messageSent': 'تم إرسال الرسالة بنجاح!',
      'message.candidateDeleted': 'تم حذف المرشح بنجاح!',
      'message.candidateCreated': 'تم إنشاء المرشح بنجاح!',
      'message.candidateUpdated': 'تم تحديث المرشح بنجاح!',
      
      // Errors
      'error.loadingData': 'خطأ في تحميل البيانات',
      'error.savingData': 'خطأ في حفظ البيانات',
      'error.uploadingFile': 'خطأ في رفع الملف',
      'error.invalidFile': 'ملف غير صالح',
      'error.fileTooLarge': 'الملف كبير جداً',
      'error.requiredFields': 'يرجى ملء جميع الحقول المطلوبة',
      
      // Placeholders
      'placeholder.search': 'بحث...',
      'placeholder.selectOption': 'اختر خياراً',
      'placeholder.enterText': 'أدخل النص هنا...',
      'placeholder.enterEmail': 'أدخل بريدك الإلكتروني',
      'placeholder.enterPhone': 'أدخل رقم هاتفك',
      'placeholder.enterName': 'أدخل اسمك',
      'placeholder.enterCompany': 'أدخل اسم الشركة',
      'placeholder.enterPosition': 'أدخل المنصب',
      
      // Labels
      'label.all': 'الكل',
      'label.yes': 'نعم',
      'label.no': 'لا',
      'label.optional': 'اختياري',
      'label.required': 'مطلوب',
      'label.file': 'ملف',
      'label.fileSize': 'حجم الملف',
      'label.fileType': 'نوع الملف',
      'label.uploadedBy': 'تم الرفع بواسطة',
      'label.uploadDate': 'تاريخ الرفع',
      'label.interviewer': 'المقابل',
      'label.meetingUrl': 'رابط الاجتماع',
      'label.adminComments': 'تعليقات المدير',
      
      // Section titles
      'section.basicInfo': 'المعلومات الأساسية',
      'section.professionalProfile': 'الملف المهني',
      'section.permissions': 'الصلاحيات',
      'section.verification': 'التحقق',
      'section.documents': 'المستندات',
      'section.interviews': 'المقابلات',
      'section.metrics': 'المقاييس',
      'section.actions': 'الإجراءات',
      
      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.candidates': 'المرشحون',
      'nav.companies': 'الشركات',
      'nav.jobs': 'الوظائف',
      'nav.courses': 'الدورات',
      'nav.simulations': 'المحاكاة',
      'nav.settings': 'الإعدادات',
      'nav.profile': 'الملف الشخصي',
      'nav.logout': 'تسجيل الخروج'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
