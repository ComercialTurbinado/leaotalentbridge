'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrPrevious, GrClock, GrStatusGood, GrStar, GrBarChart, GrNext, GrHome } from 'react-icons/gr';
import styles from './simulacao.module.css';

interface Question {
  id: number;
  text: string;
  tips?: string[];
}

interface SimulationData {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  estimatedTime: number;
  category: string;
  difficulty: string;
}

interface Answer {
  questionId: number;
  text: string;
}

export default function SimulacaoDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const loadSimulation = useCallback(async () => {
    if (!params?.id) {
      setError('ID da simulação não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/simulations/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setSimulation(data.data);
      } else {
        setError(data.message || 'Erro ao carregar simulação');
      }
    } catch (error) {
      console.error('Erro ao carregar simulação:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    if (params?.id) {
      loadSimulation();
    }
  }, [params?.id, loadSimulation]);

  const saveCurrentAnswer = () => {
    if (!currentAnswer.trim() || !simulation) return;

    const answer: Answer = {
      questionId: simulation.questions[currentQuestion].id,
      text: currentAnswer.trim()
    };

    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === answer.questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = answer;
        return updated;
      }
      return [...prev, answer];
    });
  };

  const nextQuestion = () => {
    if (!simulation) return;
    
    saveCurrentAnswer();
    
    if (currentQuestion < simulation.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      // Carregar resposta existente se houver
      const existingAnswer = answers.find(a => a.questionId === simulation.questions[currentQuestion + 1].id);
      setCurrentAnswer(existingAnswer?.text || '');
    } else {
      finishSimulation();
    }
  };

  const previousQuestion = () => {
    if (!simulation) return;
    
    saveCurrentAnswer();
    
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      // Carregar resposta existente
      const existingAnswer = answers.find(a => a.questionId === simulation.questions[currentQuestion - 1].id);
      setCurrentAnswer(existingAnswer?.text || '');
    }
  };

  const finishSimulation = async () => {
    if (!simulation || !user) return;
    
    saveCurrentAnswer();
    
    try {
      // Salvar respostas no banco de dados
      const response = await AuthService.authenticatedFetch('/api/simulation-answers', {
        method: 'POST',
        body: JSON.stringify({
          simulationId: simulation._id,
          answers: answers.map(answer => ({
            questionId: answer.questionId,
            text: answer.text,
            timestamp: new Date()
          }))
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsCompleted(true);
      } else {
        console.error('Erro ao salvar respostas:', data.message);
        // Ainda assim marca como completo localmente
        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Erro ao finalizar simulação:', error);
      // Ainda assim marca como completo localmente
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error || !simulation) {
    return (
      <div className={styles.errorPage}>
        <h1>{error || 'Simulação não encontrada'}</h1>
        <Link href="/candidato/simulacoes" className="btn btn-primary">
          Voltar para Simulações
        </Link>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className={styles.simulacaoPage}>
        <DashboardHeader user={user} userType="candidato" />
        <div className={styles.completedContainer}>
          <div className={styles.completedContent}>
            <div className={styles.completedIcon}>
              <GrStatusGood size={64} />
            </div>
            
            <h1>Simulação Concluída!</h1>
            <p>Parabéns! Você completou todas as perguntas da simulação.</p>

            <div className={styles.completedStats}>
              <div className={styles.completedStat}>
                <span className={styles.statNumber}>{simulation.questions.length}</span>
                <span className={styles.statLabel}>Perguntas Respondidas</span>
              </div>
              <div className={styles.completedStat}>
                <span className={styles.statNumber}>{simulation.estimatedTime} min</span>
                <span className={styles.statLabel}>Tempo Estimado</span>
              </div>
            </div>

            <div className={styles.completedActions}>
              <Link href="/candidato/simulacoes" className="btn btn-primary">
                <GrHome size={16} />
                Voltar às Simulações
              </Link>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setCurrentAnswer('');
                }}
              >
                Refazer Simulação
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / simulation.questions.length) * 100;

  return (
    <div className={styles.simulacaoPage}>
      <DashboardHeader user={user} userType="candidato" />

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.simulationContainer}>
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <h2>Pergunta {currentQuestion + 1}</h2>
              </div>
              
              <div className={styles.questionText}>
                <p>{simulation.questions[currentQuestion].text}</p>
              </div>

              {simulation.questions[currentQuestion].tips && (
                <div className={styles.questionTips}>
                  <h4>💡 Dicas para uma boa resposta:</h4>
                  <ul>
                    {simulation.questions[currentQuestion].tips!.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className={styles.answerSection}>
                <label htmlFor="answer">Sua resposta:</label>
                <textarea
                  id="answer"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Digite sua resposta aqui... Seja claro e objetivo."
                  rows={8}
                />
                <div className={styles.answerInfo}>
                  <span>{currentAnswer.length} caracteres</span>
                </div>
              </div>

              <div className={styles.questionActions}>
                <button 
                  className="btn btn-secondary"
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Anterior
                </button>
                
                <button 
                  className="btn btn-primary"
                  onClick={nextQuestion}
                  disabled={!currentAnswer.trim()}
                >
                  {currentQuestion === simulation.questions.length - 1 ? 'Finalizar' : 'Próxima'}
                  <GrNext size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 