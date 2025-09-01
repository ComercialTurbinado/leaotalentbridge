import { IUser } from '@/lib/models/User';
import { IJob } from '@/lib/models/Job';
import { IJobRecommendation } from '@/lib/models/JobRecommendation';
import JobRecommendation from '@/lib/models/JobRecommendation';
import Job from '@/lib/models/Job';

export interface RecommendationResult {
  job: IJob;
  recommendation: IJobRecommendation;
  matchPercentage: number;
  reasons: string[];
}

export class JobRecommendationService {
  private static readonly MAX_RECOMMENDATIONS = 10;
  private static readonly MIN_SCORE_THRESHOLD = 60;
  private static readonly RECOMMENDATION_EXPIRY_DAYS = 7;

  /**
   * Gera recomendações personalizadas para um candidato
   */
  static async generateRecommendations(userId: string): Promise<RecommendationResult[]> {
    try {
      // Buscar perfil do candidato
      const user = await this.getUserProfile(userId);
      if (!user) {
        throw new Error('Perfil do candidato não encontrado');
      }

      // Buscar vagas ativas
      const activeJobs = await Job.find({ 
        status: 'active',
        isPublic: true 
      }).populate('company', 'name size industry location');

      // Calcular scores para cada vaga
      const recommendations: RecommendationResult[] = [];

      for (const job of activeJobs) {
        const score = await this.calculateJobMatch(user, job);
        
        if (score.overall >= this.MIN_SCORE_THRESHOLD) {
          // Verificar se já existe recomendação
          const existingRecommendation = await JobRecommendation.findOne({
            userId,
            jobId: job._id
          });

          if (!existingRecommendation) {
            // Criar nova recomendação
            const recommendation = new JobRecommendation({
              userId,
              jobId: job._id,
              score: score.overall,
              reasons: score.reasons,
              skillsMatch: score.skillsMatch,
              experienceMatch: score.experienceMatch,
              locationMatch: score.locationMatch,
              salaryMatch: score.salaryMatch,
              expiresAt: new Date(Date.now() + this.RECOMMENDATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
            });

            await recommendation.save();

            recommendations.push({
              job: job as IJob,
              recommendation,
              matchPercentage: score.overall,
              reasons: score.reasons
            });
          }
        }
      }

      // Ordenar por score e retornar apenas os melhores
      return recommendations
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, this.MAX_RECOMMENDATIONS);

    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return [];
    }
  }

  /**
   * Busca recomendações existentes para um candidato
   */
  static async getRecommendations(userId: string, limit: number = 10): Promise<RecommendationResult[]> {
    try {
      const recommendations = await JobRecommendation.find({
        userId,
        applied: false,
        dismissed: false,
        expiresAt: { $gt: new Date() }
      })
      .populate('jobId')
      .sort({ score: -1, createdAt: -1 })
      .limit(limit);

      return recommendations.map(rec => ({
        job: rec.jobId as IJob,
        recommendation: rec,
        matchPercentage: rec.score,
        reasons: rec.reasons
      }));

    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      return [];
    }
  }

  /**
   * Marca uma recomendação como visualizada
   */
  static async markAsViewed(recommendationId: string): Promise<void> {
    await JobRecommendation.findByIdAndUpdate(recommendationId, {
      viewed: true
    });
  }

  /**
   * Marca uma recomendação como aplicada
   */
  static async markAsApplied(recommendationId: string): Promise<void> {
    await JobRecommendation.findByIdAndUpdate(recommendationId, {
      applied: true,
      viewed: true
    });
  }

  /**
   * Descarta uma recomendação
   */
  static async dismissRecommendation(recommendationId: string): Promise<void> {
    await JobRecommendation.findByIdAndUpdate(recommendationId, {
      dismissed: true
    });
  }

  /**
   * Calcula o match entre candidato e vaga
   */
  private static async calculateJobMatch(user: IUser, job: IJob): Promise<{
    overall: number;
    reasons: string[];
    skillsMatch: any;
    experienceMatch: any;
    locationMatch: any;
    salaryMatch: any;
  }> {
    const reasons: string[] = [];
    
    // Match de habilidades (40% do score)
    const skillsMatch = this.calculateSkillsMatch(user, job);
    if (skillsMatch.score > 80) {
      reasons.push(`Excelente match de habilidades (${skillsMatch.matched.length} habilidades compatíveis)`);
    } else if (skillsMatch.score > 60) {
      reasons.push(`Bom match de habilidades (${skillsMatch.matched.length} habilidades compatíveis)`);
    }

    // Match de experiência (25% do score)
    const experienceMatch = this.calculateExperienceMatch(user, job);
    if (experienceMatch.score > 80) {
      reasons.push('Experiência muito compatível com a vaga');
    } else if (experienceMatch.score > 60) {
      reasons.push('Experiência adequada para a vaga');
    }

    // Match de localização (20% do score)
    const locationMatch = this.calculateLocationMatch(user, job);
    if (locationMatch.score > 80) {
      reasons.push('Localização ideal');
    } else if (locationMatch.score > 60) {
      reasons.push('Localização compatível');
    }

    // Match de salário (15% do score)
    const salaryMatch = this.calculateSalaryMatch(user, job);
    if (salaryMatch.score > 80) {
      reasons.push('Faixa salarial atrativa');
    } else if (salaryMatch.score > 60) {
      reasons.push('Faixa salarial adequada');
    }

    // Calcular score geral
    const overall = Math.round(
      (skillsMatch.score * 0.4) +
      (experienceMatch.score * 0.25) +
      (locationMatch.score * 0.2) +
      (salaryMatch.score * 0.15)
    );

    return {
      overall,
      reasons,
      skillsMatch,
      experienceMatch,
      locationMatch,
      salaryMatch
    };
  }

  /**
   * Calcula match de habilidades
   */
  private static calculateSkillsMatch(user: IUser, job: IJob): any {
    const userSkills = user.skills || [];
    const jobSkills = job.requiredSkills || [];
    
    const matched = userSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );

    const missing = jobSkills.filter(jobSkill =>
      !userSkills.some(skill =>
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );

    const score = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 0;

    return {
      matched,
      missing,
      score: Math.round(score)
    };
  }

  /**
   * Calcula match de experiência
   */
  private static calculateExperienceMatch(user: IUser, job: IJob): any {
    const userExperience = user.experience || 'entry';
    const jobExperience = job.experienceLevel || 'entry';

    const experienceLevels = {
      'entry': 1,
      'junior': 2,
      'mid': 3,
      'senior': 4,
      'lead': 5,
      'executive': 6
    };

    const userLevel = experienceLevels[userExperience as keyof typeof experienceLevels] || 1;
    const jobLevel = experienceLevels[jobExperience as keyof typeof experienceLevels] || 1;

    let score = 100;
    if (userLevel < jobLevel) {
      score = Math.max(20, 100 - ((jobLevel - userLevel) * 20));
    } else if (userLevel > jobLevel + 2) {
      score = Math.max(40, 100 - ((userLevel - jobLevel - 2) * 15));
    }

    return {
      required: jobExperience,
      candidate: userExperience,
      score: Math.round(score)
    };
  }

  /**
   * Calcula match de localização
   */
  private static calculateLocationMatch(user: IUser, job: IJob): any {
    const userLocation = user.location || '';
    const jobLocation = job.location || '';

    if (!userLocation || !jobLocation) {
      return {
        required: jobLocation,
        candidate: userLocation,
        score: 50
      };
    }

    // Lógica simples de match de localização
    const userCity = userLocation.toLowerCase().split(',')[0].trim();
    const jobCity = jobLocation.toLowerCase().split(',')[0].trim();

    let score = 50;
    if (userCity === jobCity) {
      score = 100;
    } else if (userLocation.toLowerCase().includes(jobCity) || jobLocation.toLowerCase().includes(userCity)) {
      score = 80;
    } else if (userLocation.toLowerCase().includes('remote') || jobLocation.toLowerCase().includes('remote')) {
      score = 90;
    }

    return {
      required: jobLocation,
      candidate: userLocation,
      score: Math.round(score)
    };
  }

  /**
   * Calcula match de salário
   */
  private static calculateSalaryMatch(user: IUser, job: IJob): any {
    const userExpectedSalary = user.expectedSalary || 0;
    const jobMinSalary = job.salaryRange?.min || 0;
    const jobMaxSalary = job.salaryRange?.max || 0;

    if (!userExpectedSalary || !jobMinSalary) {
      return {
        min: jobMinSalary,
        max: jobMaxSalary,
        candidate: userExpectedSalary,
        score: 50
      };
    }

    let score = 50;
    if (userExpectedSalary >= jobMinSalary && userExpectedSalary <= jobMaxSalary) {
      score = 100;
    } else if (userExpectedSalary < jobMinSalary) {
      const diff = (jobMinSalary - userExpectedSalary) / jobMinSalary;
      score = Math.max(20, 100 - (diff * 80));
    } else if (userExpectedSalary > jobMaxSalary) {
      const diff = (userExpectedSalary - jobMaxSalary) / jobMaxSalary;
      score = Math.max(30, 100 - (diff * 70));
    }

    return {
      min: jobMinSalary,
      max: jobMaxSalary,
      candidate: userExpectedSalary,
      score: Math.round(score)
    };
  }

  /**
   * Busca perfil do usuário
   */
  private static async getUserProfile(userId: string): Promise<IUser | null> {
    const User = (await import('@/lib/models/User')).default;
    return await User.findById(userId);
  }
}
