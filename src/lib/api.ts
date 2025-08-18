import Cookies from 'js-cookie';

// Utilitário para chamadas de API
export class ApiService {
  private static baseUrl = '/api';
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutos

  // Obter token dos cookies (consistente com AuthService)
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('leao_token') || null;
  }

  // Headers padrão com autenticação
  private static getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Cache helpers
  private static getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}?${JSON.stringify(params || {})}`;
  }

  private static getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Método genérico para fazer requisições
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = false
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options.body);
    
    // Verificar cache para requisições GET
    if (useCache && (!options.method || options.method === 'GET')) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Erro na requisição');
    }

    // Armazenar no cache apenas para requisições GET bem-sucedidas
    if (useCache && (!options.method || options.method === 'GET')) {
      this.setCachedData(cacheKey, data);
    }

    return data;
  }

  // Limpar cache específico ou todo o cache
  static clearCache(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // === AUTENTICAÇÃO ===
  static async register(userData: {
    email: string;
    password: string;
    name: string;
    type: 'candidato' | 'empresa' | 'admin';
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });
  }

  static async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
  }

  // === EMPRESAS ===
  static async createCompany(companyData: any) {
    // Limpar cache após criação
    this.clearCache();
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  static async getCompanies(params?: {
    status?: string;
    industry?: string;
    size?: string;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    fields?: string; // Campos específicos para retornar
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/companies?${searchParams.toString()}`, {}, true);
  }

  static async getCompany(id: string, fields?: string) {
    const searchParams = new URLSearchParams();
    if (fields) {
      searchParams.append('fields', fields);
    }
    
    return this.request(`/companies/${id}?${searchParams.toString()}`, {}, true);
  }

  static async updateCompany(id: string, data: any) {
    // Limpar cache após atualização
    this.clearCache();
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteCompany(id: string) {
    // Limpar cache após deleção
    this.clearCache();
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // === VAGAS ===
  static async createJob(jobData: any) {
    // Limpar cache após criação
    this.clearCache();
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  static async getJobs(params?: {
    status?: string;
    category?: string;
    workType?: string;
    location?: string;
    companyId?: string;
    search?: string;
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    limit?: number;
    candidateId?: string;
    fields?: string; // Campos específicos para retornar
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/jobs?${searchParams.toString()}`, {}, true);
  }

  static async getJob(id: string, fields?: string) {
    const searchParams = new URLSearchParams();
    if (fields) {
      searchParams.append('fields', fields);
    }
    
    return this.request(`/jobs/${id}?${searchParams.toString()}`, {}, true);
  }

  static async updateJob(id: string, data: any) {
    // Limpar cache após atualização
    this.clearCache();
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteJob(id: string) {
    // Limpar cache após deleção
    this.clearCache();
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // === CANDIDATURAS ===
  static async createApplication(applicationData: any) {
    // Limpar cache após criação
    this.clearCache();
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  static async getApplications(params?: {
    status?: string;
    jobId?: string;
    companyId?: string;
    candidateId?: string;
    search?: string;
    page?: number;
    limit?: number;
    adminApproved?: boolean;
    fields?: string; // Campos específicos para retornar
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/applications?${searchParams.toString()}`, {}, true);
  }

  static async getApplication(id: string, fields?: string) {
    const searchParams = new URLSearchParams();
    if (fields) {
      searchParams.append('fields', fields);
    }
    
    return this.request(`/applications/${id}?${searchParams.toString()}`, {}, true);
  }

  static async updateApplication(id: string, data: any) {
    // Limpar cache após atualização
    this.clearCache();
    return this.request(`/applications/${id}`, {
      method: 'PUT',	
      body: JSON.stringify(data),
    });
  }

  static async deleteApplication(id: string) {
    // Limpar cache após deleção
    this.clearCache();
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // === USUÁRIOS ===
  static async getUsers(params?: {
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
    fields?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/users?${searchParams.toString()}`, {}, true);
  }

  static async getUser(id: string, fields?: string) {
    const searchParams = new URLSearchParams();
    if (fields) {
      searchParams.append('fields', fields);
    }
    
    return this.request(`/users/${id}?${searchParams.toString()}`, {}, true);
  }

  static async updateUser(id: string, data: any) {
    // Limpar cache após atualização
    this.clearCache();
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteUser(id: string) {
    // Limpar cache após deleção
    this.clearCache();
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // === ADMIN FUNCTIONS ===
  static async releaseJobToCandidate(jobId: string, candidateId: string) {
    // Limpar cache após operação
    this.clearCache();
    return this.request('/admin/release-job', {
      method: 'POST',
      body: JSON.stringify({ jobId, candidateId }),
    });
  }

  static async releaseJobToCandidates(jobId: string, candidateIds: string[]) {
    // Limpar cache após operação
    this.clearCache();
    return this.request('/admin/release-job-bulk', {
      method: 'POST',
      body: JSON.stringify({ jobId, candidateIds }),
    });
  }

  static async approveApplicationForCompany(applicationId: string, adjustedResume?: any) {
    // Limpar cache após operação
    this.clearCache();
    return this.request('/admin/approve-application', {
      method: 'POST',
      body: JSON.stringify({ applicationId, adjustedResume }),
    });
  }

  static async getReleasedJobsForCandidate(candidateId: string) {
    return this.request(`/admin/released-jobs/${candidateId}`, {}, true);
  }

  static async getApprovedApplicationsForCompany(companyId: string) {
    return this.request(`/admin/approved-applications/${companyId}`, {}, true);
  }

  static async getEligibleCandidatesForJob(jobId: string) {
    return this.request(`/admin/eligible-candidates/${jobId}`, {}, true);
  }

  static async getPendingApplications() {
    return this.request('/admin/pending-applications', {}, true);
  }

  static async getCandidatesWithCompleteProfile() {
    return this.request('/admin/complete-candidates', {}, true);
  }

  static async adjustCandidateResume(candidateId: string, adjustedData: any) {
    // Limpar cache após operação
    this.clearCache();
    return this.request('/admin/adjust-resume', {
      method: 'POST',
      body: JSON.stringify({ candidateId, adjustedData }),
    });
  }

  static async verifyCandidateDocuments(candidateId: string, verificationData: any) {
    // Limpar cache após operação
    this.clearCache();
    return this.request('/admin/verify-documents', {
      method: 'POST',
      body: JSON.stringify({ candidateId, verificationData }),
    });
  }

  // === SIMULAÇÕES ===
  static async getSimulations() {
    return this.request('/simulations', {}, true);
  }

  static async getSimulation(id: string) {
    return this.request(`/simulations/${id}`, {}, true);
  }

  static async createSimulation(data: any) {
    // Limpar cache após criação
    this.clearCache();
    return this.request('/simulations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getSimulationAnswers() {
    return this.request('/simulation-answers', {}, true);
  }

  static async saveSimulationAnswer(data: any) {
    return this.request('/simulation-answers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // === CANDIDATO ESPECÍFICO ===
  static async getCandidateDocuments(candidateId: string) {
    return this.request(`/candidates/${candidateId}/documents`, {}, true);
  }

  static async addCandidateDocument(candidateId: string, documentData: any) {
    // Limpar cache após adição
    this.clearCache();
    return this.request(`/candidates/${candidateId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  static async getCandidateInterviews(candidateId: string) {
    return this.request(`/candidates/${candidateId}/interviews`, {}, true);
  }

  static async getCandidateApplications(candidateId: string) {
    return this.request(`/candidates/${candidateId}/applications`, {}, true);
  }

  static async getCandidateDashboard(candidateId: string) {
    return this.request(`/candidates/${candidateId}/dashboard`, {}, true);
  }
} 