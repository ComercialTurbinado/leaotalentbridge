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

// Importar o modelo Course já definido
const path = require('path');
const { Course } = require(path.resolve(__dirname, '../src/lib/models/Course.ts'));

// Se não conseguir importar, usar um schema simplificado
let CourseModel;
try {
  CourseModel = Course;
} catch (error) {
  console.log('⚠️ Usando schema simplificado...');
  const CourseSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
  CourseModel = mongoose.models.Course || mongoose.model('Course', CourseSchema);
}

// Dados dos cursos de exemplo
const sampleCourses = [
  {
    title: 'React.js Completo - Do Zero ao Avançado',
    slug: 'react-js-completo-zero-avancado',
    shortDescription: 'Aprenda React.js desde os conceitos básicos até técnicas avançadas. Inclui hooks, context API, Redux e projetos práticos.',
    longDescription: 'Este curso completo de React.js foi desenvolvido para levar você do nível iniciante ao avançado. Você aprenderá todos os conceitos fundamentais do React, incluindo componentes, props, state, hooks, context API, e muito mais. O curso inclui projetos práticos que você pode adicionar ao seu portfólio.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    trailerVideo: 'https://example.com/trailer-react.mp4',
    category: 'technology',
    subcategory: 'Frontend Development',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    level: 'intermediate',
    modules: [
      {
        title: 'Introdução ao React',
        description: 'Conceitos básicos, instalação e primeiro componente',
        order: 1,
        lessons: [
          {
            title: 'O que é React?',
            description: 'Introdução aos conceitos fundamentais do React',
            type: 'video',
            duration: 15,
            order: 1,
            content: {
              videoUrl: 'https://example.com/lesson1.mp4'
            },
            resources: [
              {
                type: 'pdf',
                title: 'Guia de Instalação',
                url: 'https://example.com/guia-instalacao.pdf',
                downloadable: true
              }
            ],
            isPreview: true,
            isRequired: true
          },
          {
            title: 'Configurando o Ambiente',
            description: 'Como instalar e configurar React',
            type: 'video',
            duration: 20,
            order: 2,
            content: {
              videoUrl: 'https://example.com/lesson2.mp4'
            },
            resources: [],
            isPreview: false,
            isRequired: true
          }
        ],
        estimatedDuration: 35
      },
      {
        title: 'Componentes e Props',
        description: 'Criando componentes reutilizáveis e passando dados',
        order: 2,
        lessons: [
          {
            title: 'Criando seu Primeiro Componente',
            description: 'Como criar e usar componentes em React',
            type: 'video',
            duration: 25,
            order: 1,
            content: {
              videoUrl: 'https://example.com/lesson3.mp4'
            },
            resources: [
              {
                type: 'code',
                title: 'Código do Componente',
                url: 'https://github.com/exemplo/componente',
                downloadable: false
              }
            ],
            isPreview: false,
            isRequired: true
          }
        ],
        estimatedDuration: 25
      }
    ],
    totalDuration: 60,
    totalLessons: 3,
    requirements: {
      prerequisites: ['HTML básico', 'CSS básico'],
      minimumLevel: 'beginner',
      requiredSkills: ['JavaScript básico'],
      recommendedExperience: '3 meses de experiência com JavaScript'
    },
    whatYoullLearn: [
      'Fundamentos do React',
      'Componentes funcionais e de classe',
      'Hooks (useState, useEffect, etc.)',
      'Gerenciamento de estado',
      'Roteamento com React Router',
      'Integração com APIs'
    ],
    targetAudience: [
      'Desenvolvedores iniciantes em React',
      'Desenvolvedores que querem se aprofundar em React',
      'Profissionais buscando mudança de carreira'
    ],
    instructor: {
      name: 'Carlos Silva',
      bio: 'Desenvolvedor Full Stack com mais de 8 anos de experiência em React e tecnologias web modernas.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      expertise: ['React', 'JavaScript', 'Node.js', 'TypeScript'],
      experience: '8 anos de experiência em desenvolvimento web',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/carlossilva',
        github: 'https://github.com/carlossilva',
        website: 'https://carlossilva.dev'
      }
    },
    language: 'pt-BR',
    pricing: {
      type: 'free',
      price: 0,
      currency: 'USD'
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    publishedAt: new Date('2024-01-15'),
    lastUpdatedAt: new Date(),
    metrics: {
      totalStudents: 2847,
      completionRate: 75,
      averageRating: 4.8,
      totalReviews: 342,
      totalTimeSpent: 120000,
      popularityScore: 95
    },
    seoTitle: 'Curso Completo de React.js - Do Zero ao Avançado',
    seoDescription: 'Aprenda React.js com nosso curso completo. Inclui hooks, context API, Redux e projetos práticos.',
    seoKeywords: ['react', 'javascript', 'frontend', 'curso', 'programação']
  },
  {
    title: 'UX/UI Design para Iniciantes',
    slug: 'ux-ui-design-iniciantes',
    shortDescription: 'Fundamentos de design de experiência do usuário e interface. Aprenda Figma, prototipagem e design thinking.',
    longDescription: 'Um curso abrangente sobre UX/UI Design que cobre desde os fundamentos até a criação de protótipos interativos. Você aprenderá metodologias de design thinking, pesquisa com usuários, criação de wireframes e protótipos usando Figma.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    category: 'design',
    subcategory: 'UX/UI Design',
    tags: ['UX', 'UI', 'Design', 'Figma', 'Prototipagem'],
    level: 'beginner',
    modules: [
      {
        title: 'Fundamentos do Design',
        description: 'Princípios básicos de design e teoria das cores',
        order: 1,
        lessons: [
          {
            title: 'Introdução ao UX/UI',
            description: 'Diferenças entre UX e UI design',
            type: 'video',
            duration: 20,
            order: 1,
            content: {
              videoUrl: 'https://example.com/ux-intro.mp4'
            },
            resources: [],
            isPreview: true,
            isRequired: true
          }
        ],
        estimatedDuration: 20
      }
    ],
    totalDuration: 20,
    totalLessons: 1,
    requirements: {
      prerequisites: [],
      minimumLevel: 'beginner',
      requiredSkills: [],
      recommendedExperience: 'Nenhuma experiência necessária'
    },
    whatYoullLearn: [
      'Princípios de UX Design',
      'Teoria das cores e tipografia',
      'Prototipagem com Figma',
      'Pesquisa com usuários',
      'Design thinking'
    ],
    targetAudience: [
      'Iniciantes em design',
      'Desenvolvedores que querem aprender design',
      'Profissionais em transição de carreira'
    ],
    instructor: {
      name: 'Ana Costa',
      bio: 'UX/UI Designer com mais de 6 anos de experiência em startups e grandes empresas.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      expertise: ['UX Design', 'UI Design', 'Figma', 'Design Thinking'],
      experience: '6 anos de experiência em design',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/anacosta',
        website: 'https://anacosta.design'
      }
    },
    language: 'pt-BR',
    pricing: {
      type: 'paid',
      price: 49.99,
      currency: 'USD',
      promotionalPrice: 29.99,
      promotionEndsAt: new Date('2024-12-31')
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: false,
    publishedAt: new Date('2024-02-01'),
    lastUpdatedAt: new Date(),
    metrics: {
      totalStudents: 1923,
      completionRate: 82,
      averageRating: 4.7,
      totalReviews: 198,
      totalTimeSpent: 80000,
      popularityScore: 88
    }
  },
  {
    title: 'Python para Análise de Dados',
    slug: 'python-analise-dados',
    shortDescription: 'Aprenda Python para ciência de dados com pandas, numpy, matplotlib e muito mais.',
    longDescription: 'Curso completo de Python focado em análise de dados. Você aprenderá a usar as principais bibliotecas como pandas, numpy, matplotlib e seaborn para manipular, analisar e visualizar dados.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
    category: 'technology',
    subcategory: 'Data Science',
    tags: ['Python', 'Data Science', 'Pandas', 'Numpy', 'Análise de Dados'],
    level: 'intermediate',
    modules: [
      {
        title: 'Introdução ao Python',
        description: 'Sintaxe básica e estruturas de dados',
        order: 1,
        lessons: [
          {
            title: 'Primeiros passos com Python',
            description: 'Instalação e conceitos básicos',
            type: 'video',
            duration: 30,
            order: 1,
            content: {
              videoUrl: 'https://example.com/python-intro.mp4'
            },
            resources: [],
            isPreview: true,
            isRequired: true
          }
        ],
        estimatedDuration: 30
      }
    ],
    totalDuration: 30,
    totalLessons: 1,
    requirements: {
      prerequisites: ['Matemática básica'],
      minimumLevel: 'beginner',
      requiredSkills: ['Lógica de programação básica'],
      recommendedExperience: 'Conhecimento básico de programação'
    },
    whatYoullLearn: [
      'Sintaxe Python',
      'Pandas para manipulação de dados',
      'Numpy para computação numérica',
      'Matplotlib para visualização',
      'Análise exploratória de dados'
    ],
    targetAudience: [
      'Analistas de dados',
      'Cientistas de dados iniciantes',
      'Profissionais que trabalham com dados'
    ],
    instructor: {
      name: 'Roberto Lima',
      bio: 'Cientista de dados com PhD em Estatística e 10 anos de experiência na área.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      expertise: ['Python', 'Data Science', 'Machine Learning', 'Estatística'],
      experience: '10 anos de experiência em ciência de dados',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/robertolima',
        github: 'https://github.com/robertolima'
      }
    },
    language: 'pt-BR',
    pricing: {
      type: 'free',
      price: 0,
      currency: 'USD'
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    publishedAt: new Date('2024-01-20'),
    lastUpdatedAt: new Date(),
    metrics: {
      totalStudents: 3456,
      completionRate: 68,
      averageRating: 4.6,
      totalReviews: 287,
      totalTimeSpent: 150000,
      popularityScore: 92
    }
  },
  {
    title: 'Inglês para Negócios',
    slug: 'ingles-negocios',
    shortDescription: 'Desenvolva suas habilidades em inglês corporativo para reuniões, apresentações e comunicação empresarial.',
    longDescription: 'Curso especializado em inglês para o ambiente empresarial. Aprenda vocabulário específico, como conduzir reuniões, fazer apresentações e se comunicar efetivamente em contextos profissionais.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
    category: 'languages',
    subcategory: 'Business English',
    tags: ['Inglês', 'Business', 'Comunicação', 'Negócios'],
    level: 'intermediate',
    modules: [
      {
        title: 'Inglês em Reuniões',
        description: 'Como participar e conduzir reuniões em inglês',
        order: 1,
        lessons: [
          {
            title: 'Vocabulário para Reuniões',
            description: 'Expressões e termos essenciais',
            type: 'video',
            duration: 25,
            order: 1,
            content: {
              videoUrl: 'https://example.com/business-english.mp4'
            },
            resources: [],
            isPreview: true,
            isRequired: true
          }
        ],
        estimatedDuration: 25
      }
    ],
    totalDuration: 25,
    totalLessons: 1,
    requirements: {
      prerequisites: ['Inglês intermediário'],
      minimumLevel: 'intermediate',
      requiredSkills: ['Inglês básico'],
      recommendedExperience: 'Nível intermediário de inglês'
    },
    whatYoullLearn: [
      'Vocabulário empresarial',
      'Como conduzir reuniões',
      'Apresentações em inglês',
      'E-mails profissionais',
      'Negociações'
    ],
    targetAudience: [
      'Profissionais que trabalham com empresas internacionais',
      'Gerentes e executivos',
      'Pessoas em busca de oportunidades globais'
    ],
    instructor: {
      name: 'Sarah Johnson',
      bio: 'Professora nativa de inglês especializada em inglês corporativo com 12 anos de experiência.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      expertise: ['Business English', 'Corporate Communication', 'Presentation Skills'],
      experience: '12 anos ensinando inglês corporativo',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjohnson'
      }
    },
    language: 'pt-BR',
    pricing: {
      type: 'paid',
      price: 79.99,
      currency: 'USD'
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: false,
    publishedAt: new Date('2024-02-10'),
    lastUpdatedAt: new Date(),
    metrics: {
      totalStudents: 1456,
      completionRate: 85,
      averageRating: 4.9,
      totalReviews: 156,
      totalTimeSpent: 95000,
      popularityScore: 87
    }
  },
  {
    title: 'Liderança e Gestão de Equipes',
    slug: 'lideranca-gestao-equipes',
    shortDescription: 'Desenvolva habilidades de liderança, comunicação efetiva e gestão de pessoas para se tornar um líder inspirador.',
    longDescription: 'Curso abrangente sobre liderança e gestão de equipes. Aprenda técnicas de motivação, delegação, feedback, resolução de conflitos e como criar um ambiente de trabalho produtivo e colaborativo.',
    thumbnail: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop',
    category: 'soft_skills',
    subcategory: 'Leadership',
    tags: ['Liderança', 'Gestão', 'Soft Skills', 'Management'],
    level: 'intermediate',
    modules: [
      {
        title: 'Fundamentos da Liderança',
        description: 'Princípios básicos de liderança efetiva',
        order: 1,
        lessons: [
          {
            title: 'O que faz um bom líder?',
            description: 'Características e competências de líderes eficazes',
            type: 'video',
            duration: 35,
            order: 1,
            content: {
              videoUrl: 'https://example.com/leadership.mp4'
            },
            resources: [],
            isPreview: true,
            isRequired: true
          }
        ],
        estimatedDuration: 35
      }
    ],
    totalDuration: 35,
    totalLessons: 1,
    requirements: {
      prerequisites: [],
      minimumLevel: 'beginner',
      requiredSkills: [],
      recommendedExperience: 'Experiência profissional básica'
    },
    whatYoullLearn: [
      'Estilos de liderança',
      'Comunicação assertiva',
      'Gestão de conflitos',
      'Motivação de equipes',
      'Delegação efetiva',
      'Feedback construtivo'
    ],
    targetAudience: [
      'Gestores e supervisores',
      'Profissionais em posições de liderança',
      'Pessoas que aspiram a cargos de gestão'
    ],
    instructor: {
      name: 'Marina Santos',
      bio: 'Coach executiva e consultora em liderança com mais de 15 anos de experiência em gestão de pessoas.',
      avatar: 'https://images.unsplash.com/photo-1559599238-db3f299ec43c?w=150&h=150&fit=crop&crop=face',
      expertise: ['Leadership', 'Executive Coaching', 'Team Management', 'Organizational Psychology'],
      experience: '15 anos em liderança e coaching executivo',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/marinasantos',
        website: 'https://marinasantos.com.br'
      }
    },
    language: 'pt-BR',
    pricing: {
      type: 'paid',
      price: 99.99,
      currency: 'USD',
      promotionalPrice: 69.99,
      promotionEndsAt: new Date('2024-12-31')
    },
    hasCertificate: true,
    status: 'published',
    isPublic: true,
    isFeatured: true,
    publishedAt: new Date('2024-02-15'),
    lastUpdatedAt: new Date(),
    metrics: {
      totalStudents: 2198,
      completionRate: 78,
      averageRating: 4.8,
      totalReviews: 241,
      totalTimeSpent: 110000,
      popularityScore: 90
    }
  }
];

// Função principal para popular os cursos
async function seedCourses() {
  try {
    await connectToDatabase();
    
    console.log('🗑️ Limpando cursos existentes...');
    await CourseModel.deleteMany({});
    
    console.log('📚 Inserindo cursos de exemplo...');
    
    // Buscar um usuário admin para ser o criador dos cursos
    const User = mongoose.model('User', new mongoose.Schema({}));
    const adminUser = await User.findOne({ type: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️ Usuário admin não encontrado. Criando cursos sem createdBy...');
    }
    
    const coursesToInsert = sampleCourses.map(course => ({
      ...course,
      createdBy: adminUser ? adminUser._id : undefined
    }));
    
    const insertedCourses = await CourseModel.insertMany(coursesToInsert);
    
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
