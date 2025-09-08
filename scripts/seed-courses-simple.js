const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Conectar ao MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

// Schema simplificado com strict: false para permitir qualquer estrutura
const CourseSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

// Dados dos cursos de exemplo (estrutura simplificada)
const sampleCourses = [
  {
    title: 'React.js Completo - Do Zero ao Avançado',
    slug: 'react-js-completo-zero-avancado',
    shortDescription: 'Aprenda React.js desde os conceitos básicos até técnicas avançadas. Inclui hooks, context API, Redux e projetos práticos.',
    longDescription: 'Este curso completo de React.js foi desenvolvido para levar você do nível iniciante ao avançado. Você aprenderá todos os conceitos fundamentais do React, incluindo componentes, props, state, hooks, context API, e muito mais.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    category: 'technology',
    level: 'intermediate',
    totalDuration: 2400, // 40 horas em minutos
    totalLessons: 45,
    instructor: {
      name: 'Carlos Silva',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 2847,
      averageRating: 4.8,
      totalReviews: 342,
      popularityScore: 95
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    language: 'pt-BR',
    publishedAt: new Date('2024-01-15')
  },
  {
    title: 'UX/UI Design para Iniciantes',
    slug: 'ux-ui-design-iniciantes',
    shortDescription: 'Fundamentos de design de experiência do usuário e interface. Aprenda Figma, prototipagem e design thinking.',
    longDescription: 'Um curso abrangente sobre UX/UI Design que cobre desde os fundamentos até a criação de protótipos interativos.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    category: 'design',
    level: 'beginner',
    totalDuration: 1500, // 25 horas em minutos
    totalLessons: 32,
    instructor: {
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'paid',
      price: 49.99,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 1923,
      averageRating: 4.7,
      totalReviews: 198,
      popularityScore: 88
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: false,
    language: 'pt-BR',
    publishedAt: new Date('2024-02-01')
  },
  {
    title: 'Python para Análise de Dados',
    slug: 'python-analise-dados',
    shortDescription: 'Aprenda Python para ciência de dados com pandas, numpy, matplotlib e muito mais.',
    longDescription: 'Curso completo de Python focado em análise de dados. Você aprenderá a usar as principais bibliotecas para manipular, analisar e visualizar dados.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
    category: 'technology',
    level: 'intermediate',
    totalDuration: 1800, // 30 horas em minutos
    totalLessons: 38,
    instructor: {
      name: 'Roberto Lima',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 3456,
      averageRating: 4.6,
      totalReviews: 287,
      popularityScore: 92
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    language: 'pt-BR',
    publishedAt: new Date('2024-01-20')
  },
  {
    title: 'Inglês para Negócios',
    slug: 'ingles-negocios',
    shortDescription: 'Desenvolva suas habilidades em inglês corporativo para reuniões, apresentações e comunicação empresarial.',
    longDescription: 'Curso especializado em inglês para o ambiente empresarial. Aprenda vocabulário específico, como conduzir reuniões, fazer apresentações e se comunicar efetivamente em contextos profissionais.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
    category: 'languages',
    level: 'intermediate',
    totalDuration: 1200, // 20 horas em minutos
    totalLessons: 25,
    instructor: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'paid',
      price: 79.99,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 1456,
      averageRating: 4.9,
      totalReviews: 156,
      popularityScore: 87
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: false,
    language: 'pt-BR',
    publishedAt: new Date('2024-02-10')
  },
  {
    title: 'Liderança e Gestão de Equipes',
    slug: 'lideranca-gestao-equipes',
    shortDescription: 'Desenvolva habilidades de liderança, comunicação efetiva e gestão de pessoas para se tornar um líder inspirador.',
    longDescription: 'Curso abrangente sobre liderança e gestão de equipes. Aprenda técnicas de motivação, delegação, feedback, resolução de conflitos e como criar um ambiente de trabalho produtivo.',
    thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop',
    category: 'soft_skills',
    level: 'intermediate',
    totalDuration: 1440, // 24 horas em minutos
    totalLessons: 30,
    instructor: {
      name: 'Marina Santos',
      avatar: 'https://images.unsplash.com/photo-1559599238-db3f299ec43c?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'paid',
      price: 99.99,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 2198,
      averageRating: 4.8,
      totalReviews: 241,
      popularityScore: 90
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    language: 'pt-BR',
    publishedAt: new Date('2024-02-15')
  },
  {
    title: 'JavaScript Moderno - ES6+',
    slug: 'javascript-moderno-es6',
    shortDescription: 'Domine as funcionalidades modernas do JavaScript incluindo ES6, ES7, ES8 e as melhores práticas de desenvolvimento.',
    longDescription: 'Aprenda todas as funcionalidades modernas do JavaScript, desde ES6 até as versões mais recentes. Inclui async/await, destructuring, modules, classes e muito mais.',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
    category: 'technology',
    level: 'intermediate',
    totalDuration: 1920, // 32 horas em minutos
    totalLessons: 42,
    instructor: {
      name: 'Fernando Oliveira',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'free',
      price: 0,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 4234,
      averageRating: 4.7,
      totalReviews: 398,
      popularityScore: 94
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    language: 'pt-BR',
    publishedAt: new Date('2024-01-10')
  },
  {
    title: 'Marketing Digital Completo',
    slug: 'marketing-digital-completo',
    shortDescription: 'Aprenda estratégias completas de marketing digital, desde SEO e SEM até mídias sociais e automação.',
    longDescription: 'Curso completo de marketing digital cobrindo todas as principais estratégias e ferramentas do mercado atual.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    category: 'business',
    level: 'beginner',
    totalDuration: 2100, // 35 horas em minutos
    totalLessons: 48,
    instructor: {
      name: 'Luciana Ferreira',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face'
    },
    pricing: {
      type: 'paid',
      price: 149.99,
      currency: 'USD'
    },
    metrics: {
      totalStudents: 1876,
      averageRating: 4.5,
      totalReviews: 167,
      popularityScore: 85
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: false,
    language: 'pt-BR',
    publishedAt: new Date('2024-02-20')
  }
];

// Função principal para popular os cursos
async function seedCourses() {
  try {
    await connectToDatabase();
    
    console.log('🗑️ Limpando cursos existentes...');
    await Course.deleteMany({});
    
    console.log('📚 Inserindo cursos de exemplo...');
    
    // Buscar um usuário admin para ser o criador dos cursos
    const User = mongoose.model('User', new mongoose.Schema({}));
    const adminUser = await User.findOne({ type: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️ Usuário admin não encontrado. Criando cursos sem createdBy...');
    }
    
    const coursesToInsert = sampleCourses.map(course => ({
      ...course,
      createdBy: adminUser ? adminUser._id : undefined,
      lastUpdatedAt: new Date()
    }));
    
    const insertedCourses = await Course.insertMany(coursesToInsert);
    
    console.log(`✅ ${insertedCourses.length} cursos inseridos com sucesso!`);
    
    // Listar os cursos criados
    console.log('\n📋 Cursos criados:');
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.category} - ${course.level})`);
    });
    
    console.log('\n🎉 Seed de cursos concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao inserir cursos:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔐 Conexão com MongoDB fechada');
  }
}

// Executar o script
if (require.main === module) {
  seedCourses();
}

module.exports = { seedCourses };
