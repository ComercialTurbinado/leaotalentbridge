'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { 
  GrPrevious, 
  GrStar, 
  GrBarChart, 
  GrStatusCritical, 
  GrHome,
  GrNext,
  GrDownload,
  GrShare,
  GrRefresh
} from 'react-icons/gr';
import styles from './resultado.module.css';

interface SimulationResult {
  id: string;
  simulationId: string;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  recommendations: string[];
  nextSteps: string[];
}

export default function ResultadoSimulacaoPage() {
  const router = useRouter();
  const params = useParams();
  const simulationId = params?.id as string;
  
  const [user, setUser] = useState<UserType | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'candidato') {
      router.push('/candidato/login');
      return;
    }
    setUser(currentUser);
    loadResult();
  }, [router, simulationId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulando dados do resultado
      const mockResult: SimulationResult = {
        id: '1',
        simulationId: simulationId,
        score: 85,
        maxScore: 100,
        percentage: 85,
        completedAt: new Date().toISOString(),
        timeSpent: 1800, // 30 minutos
        answers: [
          {
            questionId: '1',
            answer: 'Resposta A',
            isCorrect: true,
            feedback: 'Excelente! Você demonstrou conhecimento técnico sólido.'
          },
          {
            questionId: '2',
            answer: 'Resposta B',
            isCorrect: false,
            feedback: 'Revise os conceitos de liderança e gestão de equipes.'
          }
        ],
        recommendations: [
          'Continue estudando frameworks de desenvolvimento',
          'Pratique mais exercícios de lógica de programação',
          'Desenvolva suas habilidades de comunicação'
        ],
        nextSteps: [
          'Inscreva-se no curso de React Avançado',
          'Participe de simulações de entrevista',
          'Atualize seu portfólio com projetos recentes'
        ]
      };
      
      setResult(mockResult);
    } catch (error) {
      console.error('Erro ao carregar resultado:', error);
      setError('Erro ao carregar resultado da simulação');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return styles.scoreExcellent;
    if (percentage >= 60) return styles.scoreGood;
    if (percentage >= 40) return styles.scoreAverage;
    return styles.scorePoor;
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorContent}>
          <h2>Erro ao carregar resultado</h2>
          <p>{error || 'Resultado não encontrado'}</p>
          <Link href="/candidato/simulacoes" className="btn btn-primary">
            Voltar para Simulações
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultadoPage}>
      <DashboardHeader 
        user={user} 
        userType="candidato"
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/candidato/simulacoes" className={styles.breadcrumbLink}>
              <GrPrevious size={16} />
              Voltar para Simulações
            </Link>
          </div>

          {/* Header do Resultado */}
          <div className={styles.resultHeader}>
            <div className={styles.resultIcon}>
              <GrStatusCritical size={48} />
            </div>
            <div className={styles.resultInfo}>
              <h1>Simulação Concluída!</h1>
              <p>Parabéns! Você completou a simulação com sucesso.</p>
            </div>
          </div>

          {/* Score Principal */}
          <div className={styles.scoreSection}>
            <div className={styles.scoreCard}>
              <div className={`${styles.scoreCircle} ${getScoreColor(result.percentage)}`}>
                <span className={styles.scoreValue}>{result.percentage}%</span>
                <span className={styles.scoreLabel}>{getScoreLabel(result.percentage)}</span>
              </div>
              <div className={styles.scoreDetails}>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreNumber}>{result.score}</span>
                  <span className={styles.scoreText}>Pontos Obtidos</span>
                </div>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreNumber}>{result.maxScore}</span>
                  <span className={styles.scoreText}>Pontos Totais</span>
                </div>
                <div className={styles.scoreItem}>
                  <span className={styles.scoreNumber}>{formatTime(result.timeSpent)}</span>
                  <span className={styles.scoreText}>Tempo Gasto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Conteúdo */}
          <div className={styles.contentGrid}>
            {/* Análise de Respostas */}
            <div className={styles.contentSection}>
              <h2>Análise das Respostas</h2>
              <div className={styles.answersAnalysis}>
                {result.answers.map((answer, index) => (
                  <div key={answer.questionId} className={styles.answerItem}>
                    <div className={styles.answerHeader}>
                      <span className={styles.questionNumber}>Questão {index + 1}</span>
                      <span className={`${styles.answerStatus} ${answer.isCorrect ? styles.correct : styles.incorrect}`}>
                        {answer.isCorrect ? 'Correta' : 'Incorreta'}
                      </span>
                    </div>
                    <div className={styles.answerFeedback}>
                      <p>{answer.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações */}
            <div className={styles.contentSection}>
              <h2>Recomendações</h2>
              <div className={styles.recommendationsList}>
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className={styles.recommendationItem}>
                    <GrStar size={16} />
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Passos */}
            <div className={styles.contentSection}>
              <h2>Próximos Passos</h2>
              <div className={styles.nextStepsList}>
                {result.nextSteps.map((step, index) => (
                  <div key={index} className={styles.nextStepItem}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className={styles.actionsSection}>
            <div className={styles.actionButtons}>
              <button className={styles.actionButton}>
                <GrDownload size={18} />
                Baixar Certificado
              </button>
              <button className={styles.actionButton}>
                <GrShare size={18} />
                Compartilhar Resultado
              </button>
              <button className={styles.actionButton} onClick={loadResult}>
                <GrRefresh size={18} />
                Refazer Simulação
              </button>
            </div>
            
            <div className={styles.navigationButtons}>
              <Link href="/candidato/simulacoes" className={styles.navButton}>
                <GrHome size={18} />
                Voltar às Simulações
              </Link>
              <Link href="/candidato/dashboard" className={styles.navButton}>
                <GrNext size={18} />
                Ir ao Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 