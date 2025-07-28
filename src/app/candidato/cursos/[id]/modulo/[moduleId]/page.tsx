'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { GrPrevious, GrNext, GrPlay, GrPause, GrVolume, GrVolumeMute, GrUndo, GrClock, GrStatusGood, GrLock, GrDocument, GrVideo, GrDownload, GrUser, GrNotification, GrLogout, GrShare, GrView, GrGroup, GrStar, GrLike, GrBook, GrExpand, GrTarget, GrChat } from 'react-icons/gr';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import styles from './modulo.module.css';

interface CourseModule {
  id: number;
  title: string;
  description: string;
  duration: number; // em minutos
  type: 'video' | 'text' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
  videoUrl?: string;
  textContent?: string;
  resources?: {
    type: 'pdf' | 'link' | 'code';
    title: string;
    url: string;
    size?: string;
  }[];
  quiz?: {
    questions: {
      id: number;
      question: string;
      options: string[];
      correct: number;
    }[];
  };
}

interface Course {
  id: number;
  title: string;
  modules: CourseModule[];
  instructor: string;
  instructorAvatar: string;
}

export default function ModuloTreinamento() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string || "1";
  const moduleId = params?.moduleId as string || "1";
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState('content');
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<{[key: number]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const loadCourse = useCallback(() => {
    // Mock data - em produção viria de uma API
    const mockCourse: Course = {
      id: parseInt(courseId),
      title: 'React.js Completo - Do Zero ao Avançado',
      instructor: 'Carlos Silva',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
      modules: [
        {
          id: 1,
          title: 'Introdução ao React',
          description: 'Conceitos básicos, instalação e primeiro componente',
          duration: 45,
          type: 'video',
          completed: true,
          locked: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          textContent: `
# Introdução ao React

React é uma biblioteca JavaScript para construir interfaces de usuário. Foi criada pelo Facebook e é mantida por uma comunidade ativa de desenvolvedores.

## O que é React?

React é uma biblioteca declarativa, eficiente e flexível para criar interfaces de usuário. Ela permite compor UIs complexas a partir de pequenos e isolados pedaços de código chamados "componentes".

## Principais Conceitos

### 1. Componentes
Componentes são como funções JavaScript. Eles aceitam entradas arbitrárias (chamadas "props") e retornam elementos React que descrevem o que deve aparecer na tela.

### 2. JSX
JSX é uma extensão de sintaxe para JavaScript. É recomendado usar JSX com React para descrever como a UI deveria parecer.

### 3. Props
Props são argumentos passados para componentes React. Props são passadas para componentes via atributos HTML.

### 4. State
State é similar a props, mas é privado e totalmente controlado pelo componente.

## Instalação

Para começar com React, você pode usar o Create React App:

\`\`\`bash
npx create-react-app meu-app
cd meu-app
npm start
\`\`\`

## Primeiro Componente

Aqui está um exemplo de um componente React simples:

\`\`\`jsx
function Welcome(props) {
  return <h1>Olá, {props.name}</h1>;
}
\`\`\`

Este componente aceita uma prop chamada "name" e retorna um elemento JSX.
          `,
          resources: [
            { type: 'pdf', title: 'Guia de Instalação React', url: '#', size: '2.5 MB' },
            { type: 'code', title: 'Código do Projeto Inicial', url: '#', size: '1.2 MB' },
            { type: 'link', title: 'Documentação Oficial React', url: 'https://reactjs.org' }
          ]
        },
        {
          id: 2,
          title: 'Componentes e Props',
          description: 'Criando componentes reutilizáveis e passando dados',
          duration: 60,
          type: 'video',
          completed: true,
          locked: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
        },
        {
          id: 3,
          title: 'State e Eventos',
          description: 'Gerenciando estado e manipulando eventos',
          duration: 75,
          type: 'video',
          completed: true,
          locked: false
        },
        {
          id: 4,
          title: 'Hooks Essenciais',
          description: 'useState, useEffect e outros hooks fundamentais',
          duration: 90,
          type: 'video',
          completed: false,
          locked: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          textContent: `
# Hooks Essenciais do React

Os Hooks são uma adição ao React 16.8. Eles permitem que você use state e outras funcionalidades do React sem escrever uma classe.

## useState

O Hook useState permite adicionar state a componentes funcionais:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Você clicou {count} vezes</p>
      <button onClick={() => setCount(count + 1)}>
        Clique aqui
      </button>
    </div>
  );
}
\`\`\`

## useEffect

O Hook useEffect permite executar efeitos colaterais em componentes funcionais:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Você clicou \${count} vezes\`;
  });

  return (
    <div>
      <p>Você clicou {count} vezes</p>
      <button onClick={() => setCount(count + 1)}>
        Clique aqui
      </button>
    </div>
  );
}
\`\`\`

## Regras dos Hooks

1. Apenas chame Hooks no nível superior
2. Apenas chame Hooks de funções React
3. Use o ESLint plugin para React Hooks
          `,
          quiz: {
            questions: [
              {
                id: 1,
                question: 'Qual Hook é usado para adicionar state a componentes funcionais?',
                options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                correct: 1
              },
              {
                id: 2,
                question: 'O que o useEffect permite fazer?',
                options: [
                  'Apenas gerenciar state',
                  'Apenas fazer requisições HTTP',
                  'Executar efeitos colaterais',
                  'Apenas manipular eventos'
                ],
                correct: 2
              },
              {
                id: 3,
                question: 'Onde devemos chamar os Hooks?',
                options: [
                  'Dentro de loops',
                  'Dentro de condições',
                  'No nível superior da função',
                  'Dentro de outras funções'
                ],
                correct: 2
              }
            ]
          }
        },
        {
          id: 5,
          title: 'Context API',
          description: 'Gerenciamento de estado global com Context',
          duration: 80,
          type: 'video',
          completed: false,
          locked: false
        }
      ]
    };

    setCourse(mockCourse);
    setLoading(false);
    
    // Encontrar o módulo atual
    const courseModule = mockCourse.modules.find(m => m.id === parseInt(moduleId));
    if (courseModule) {
      setCurrentModule(courseModule);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
    loadCourse();
  }, [router, loadCourse]);

  const handleLogout = () => {
    AuthService.logout();
    router.push('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setCurrentTime(video.currentTime);
    setDuration(video.duration);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    const video = document.querySelector('video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = document.querySelector('video');
    const newTime = parseFloat(e.target.value);
    if (video) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = document.querySelector('video');
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    const video = document.querySelector('video');
    if (video) {
      if (isMuted) {
        video.volume = volume;
        setIsMuted(false);
      } else {
        video.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const skipTime = (seconds: number) => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    }
  };

  const handleQuizAnswer = (questionId: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitQuiz = () => {
    setShowQuizResults(true);
  };

  const getQuizScore = () => {
    if (!currentModule?.quiz) return 0;
    
    let correct = 0;
    currentModule.quiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correct) {
        correct++;
      }
    });
    
    return Math.round((correct / currentModule.quiz.questions.length) * 100);
  };

  const getNextModule = () => {
    if (!course || !currentModule) return null;
    const currentIndex = course.modules.findIndex(m => m.id === currentModule.id);
    return currentIndex < course.modules.length - 1 ? course.modules[currentIndex + 1] : null;
  };

  const getPreviousModule = () => {
    if (!course || !currentModule) return null;
    const currentIndex = course.modules.findIndex(m => m.id === currentModule.id);
    return currentIndex > 0 ? course.modules[currentIndex - 1] : null;
  };

  const markAsCompleted = () => {
    // Em produção, isso faria uma chamada para a API
    if (currentModule) {
      setCurrentModule(prev => prev ? { ...prev, completed: true } : null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!course || !currentModule) {
    return (
      <div className={styles.errorPage}>
        <h1>Módulo não encontrado</h1>
        <Link href={`/candidato/cursos/${courseId}`} className="btn btn-primary">
          Voltar ao Curso
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.moduloPage}>
      <DashboardHeader user={user} userType="candidato" />

      <div className={styles.moduleLayout}>
        {/* Main Content */}
        <main className={styles.mainContent}>
          {/* Video Player */}
          {currentModule.type === 'video' && currentModule.videoUrl && (
            <div className={styles.videoContainer}>
              <div 
                className={styles.videoPlayer}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                <video
                  src={currentModule.videoUrl}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onLoadedMetadata={handleVideoTimeUpdate}
                  className={styles.video}
                />
                
                {showControls && (
                  <div className={styles.videoControls}>
                    <div className={styles.progressContainer}>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className={styles.progressBar}
                      />
                    </div>
                    
                    <div className={styles.controlsRow}>
                      <div className={styles.leftControls}>
                        <button onClick={togglePlayPause} className={styles.playBtn}>
                          {isPlaying ? <GrPause size={20} /> : <GrPlay size={20} />}
                        </button>
                        
                        <button onClick={() => skipTime(-10)} className={styles.skipBtn}>
                          <GrPrevious size={18} />
                        </button>
                        
                        <button onClick={() => skipTime(10)} className={styles.skipBtn}>
                          <GrNext size={18} />
                        </button>
                        
                        <div className={styles.volumeControl}>
                          <button onClick={toggleMute} className={styles.volumeBtn}>
                            {isMuted || volume === 0 ? <GrVolumeMute size={18} /> : <GrVolume size={18} />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className={styles.volumeSlider}
                          />
                        </div>
                        
                        <span className={styles.timeDisplay}>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      
                      <div className={styles.rightControls}>
                        <select 
                          value={playbackRate} 
                          onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                          className={styles.speedSelect}
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                        
                        <button className={styles.fullscreenBtn}>
                          <GrExpand size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className={styles.contentTabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'content' ? styles.active : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <GrBook size={16} />
              Conteúdo
            </button>
            
            {currentModule.resources && currentModule.resources.length > 0 && (
              <button 
                className={`${styles.tab} ${activeTab === 'resources' ? styles.active : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                <GrDownload size={16} />
                Recursos ({currentModule.resources.length})
              </button>
            )}
            
            {currentModule.quiz && (
              <button 
                className={`${styles.tab} ${activeTab === 'quiz' ? styles.active : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <GrTarget size={16} />
                Quiz ({currentModule.quiz.questions.length} questões)
              </button>
            )}
            
            <button 
              className={`${styles.tab} ${activeTab === 'discussion' ? styles.active : ''}`}
              onClick={() => setActiveTab('discussion')}
            >
              <GrChat size={16} />
              Discussão
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'content' && (
              <div className={styles.contentTab}>
                <div className={styles.moduleHeader}>
                  <h1>{currentModule.title}</h1>
                  <p>{currentModule.description}</p>
                  
                  <div className={styles.moduleStats}>
                    <div className={styles.statItem}>
                      <GrClock size={16} />
                      <span>{currentModule.duration} minutos</span>
                    </div>
                    <div className={styles.statItem}>
                      <GrView size={16} />
                      <span>1.2k visualizações</span>
                    </div>
                    {currentModule.completed && (
                      <div className={styles.statItem}>
                        <GrStatusGood size={16} className={styles.completed} />
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>
                </div>

                {currentModule.textContent && (
                  <div className={styles.textContent}>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: currentModule.textContent
                          .replace(/\n/g, '<br>')
                          .replace(/```[\s\S]*?```/g, (match) => `<pre><code>${match.slice(3, -3)}</code></pre>`)
                          .replace(/`(.*?)`/g, '<code>$1</code>')
                          .replace(/### (.*)/g, '<h3>$1</h3>')
                          .replace(/## (.*)/g, '<h2>$1</h2>')
                          .replace(/# (.*)/g, '<h1>$1</h1>')
                      }} 
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && currentModule.resources && (
              <div className={styles.resourcesTab}>
                <h2>Recursos do Módulo</h2>
                <div className={styles.resourcesList}>
                  {currentModule.resources.map((resource, index) => (
                    <div key={index} className={styles.resourceItem}>
                      <div className={styles.resourceIcon}>
                        {resource.type === 'pdf' && <GrDocument size={24} />}
                        {resource.type === 'code' && <GrBook size={24} />}
                        {resource.type === 'link' && <GrDownload size={24} />}
                      </div>
                      
                      <div className={styles.resourceInfo}>
                        <h3>{resource.title}</h3>
                        {resource.size && <span className={styles.resourceSize}>{resource.size}</span>}
                      </div>
                      
                      <a href={resource.url} className="btn btn-secondary btn-small" download>
                        <GrDownload size={16} />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quiz' && currentModule.quiz && (
              <div className={styles.quizTab}>
                <h2>Quiz do Módulo</h2>
                <p>Teste seus conhecimentos sobre o conteúdo apresentado.</p>
                
                <div className={styles.quizQuestions}>
                  {currentModule.quiz.questions.map((question, index) => (
                    <div key={question.id} className={styles.questionCard}>
                      <h3>Questão {index + 1}</h3>
                      <p>{question.question}</p>
                      
                      <div className={styles.options}>
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className={styles.option}>
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={optionIndex}
                              checked={quizAnswers[question.id] === optionIndex}
                              onChange={() => handleQuizAnswer(question.id, optionIndex)}
                              disabled={showQuizResults}
                            />
                            <span className={`${styles.optionText} ${
                              showQuizResults ? (
                                optionIndex === question.correct ? styles.correct :
                                quizAnswers[question.id] === optionIndex ? styles.incorrect : ''
                              ) : ''
                            }`}>
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {!showQuizResults ? (
                  <button 
                    onClick={submitQuiz}
                    className="btn btn-primary"
                    disabled={Object.keys(quizAnswers).length !== currentModule.quiz.questions.length}
                  >
                    Enviar Respostas
                  </button>
                ) : (
                  <div className={styles.quizResults}>
                    <h3>Resultado do Quiz</h3>
                    <div className={styles.score}>
                      <span className={styles.scoreNumber}>{getQuizScore()}%</span>
                      <span className={styles.scoreText}>
                        {getQuizScore() >= 70 ? 'Parabéns! Você passou!' : 'Você precisa estudar mais.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className={styles.discussionTab}>
                <h2>Perguntas e Respostas</h2>
                <p>Compartilhe suas dúvidas.</p>
                
                <div className={styles.discussionStats}>
                  <div className={styles.statItem}>
                    <GrChat size={16} />
                    <span>24 comentários</span>
                  </div>
                  <div className={styles.statItem}>
                    <GrGroup size={16} />
                    <span>18 participantes</span>
                  </div>
                </div>
                
                <div className={styles.commentForm}>
                  <textarea 
                    placeholder="Faça uma pergunta ou compartilhe sua opinião..."
                    className={styles.commentInput}
                  />
                  <button className="btn btn-primary">Comentar</button>
                </div>
                
                <div className={styles.commentsList}>
                  <div className={styles.comment}>
                    <Image 
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
                      alt="Ana Silva" 
                      width={40}
                      height={40}
                    />
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>Ana Silva</span>
                        <span className={styles.commentTime}>há 2 horas</span>
                      </div>
                      <p>Excelente explicação sobre hooks! Consegui entender melhor o conceito de useState.</p>
                      <div className={styles.commentActions}>
                        <button className={styles.commentAction}>
                          <GrLike size={14} />
                          12
                        </button>
                        <button className={styles.commentAction}>
                          <GrChat size={14} />
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Module Progress */}
          <div className={styles.sidebarCard}>
            <h3>Progresso do Módulo</h3>
            <div className={styles.progressInfo}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: currentModule.completed ? '100%' : '60%' }}
                ></div>
              </div>
              <span>{currentModule.completed ? '100%' : '60%'} concluído</span>
            </div>
            
            {!currentModule.completed && (
              <button onClick={markAsCompleted} className="btn btn-primary w-full">
                <GrStatusGood size={16} />
                Marcar como Concluído
              </button>
            )}
          </div>

          {/* Module Navigation */}
          <div className={styles.sidebarCard}>
            <h3>Navegação</h3>
            <div className={styles.moduleNav}>
              {getPreviousModule() && (
                <Link 
                  href={`/candidato/cursos/${courseId}/modulo/${getPreviousModule()!.id}`}
                  className={styles.navButton}
                >
                  <GrPrevious size={16} />
                  <div>
                    <span className={styles.navLabel}>Anterior</span>
                    <span className={styles.navTitle}>{getPreviousModule()!.title}</span>
                  </div>
                </Link>
              )}
              
              {getNextModule() && (
                <Link 
                  href={`/candidato/cursos/${courseId}/modulo/${getNextModule()!.id}`}
                  className={styles.navButton}
                >
                  <div>
                    <span className={styles.navLabel}>Próximo</span>
                    <span className={styles.navTitle}>{getNextModule()!.title}</span>
                  </div>
                  <GrNext size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Course Modules GrList */}
          <div className={styles.sidebarCard}>
            <h3>Módulos do Curso</h3>
            <div className={styles.modulesList}>
              {course.modules.map((courseModule, index) => (
                <Link
                  key={courseModule.id}
                  href={`/candidato/cursos/${courseId}/modulo/${courseModule.id}`}
                  className={`${styles.moduleItem} ${
                    courseModule.id === currentModule.id ? styles.active : ''
                  } ${courseModule.locked ? styles.locked : ''}`}
                >
                  <div className={styles.moduleNumber}>
                    {courseModule.completed ? (
                      <GrStatusGood size={16} className={styles.completed} />
                    ) : courseModule.locked ? (
                      <GrLock size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className={styles.moduleInfo}>
                    <span className={styles.moduleTitle}>{courseModule.title}</span>
                    <span className={styles.moduleDuration}>{courseModule.duration} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Instructor */}
          <div className={styles.sidebarCard}>
            <h3>Instrutor</h3>
            <div className={styles.instructorInfo}>
              <Image src={course.instructorAvatar} alt={course.instructor} width={40} height={40} />
              <div>
                <h4>{course.instructor}</h4>
                <p>Desenvolvedor Full Stack</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
} 