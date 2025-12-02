import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

export interface User {
  _id: string;
  email: string;
  name: string;
  type: 'candidato' | 'empresa' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  permissions?: {
    canAccessJobs: boolean;
    canApplyToJobs: boolean;
    canViewCourses: boolean;
    canAccessSimulations: boolean;
    canContactCompanies: boolean;
  };
  profile?: {
    completed: boolean;
    avatar?: string;
    phone?: string;
    company?: string;
    position?: string;
  };
  profileVerified?: boolean;
  documentsVerified?: boolean;
  companyVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'leao_token';
  private static readonly USER_KEY = 'leao_user';

  static setAuth(user: User, token: string): void {
    Cookies.set(this.TOKEN_KEY, token, { expires: 7 });
    Cookies.set(this.USER_KEY, JSON.stringify(user), { expires: 7 });
  }

  static getToken(): string | null {
    return Cookies.get(this.TOKEN_KEY) || null;
  }

  static getUser(): User | null {
    const userStr = Cookies.get(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  static getUserType(): 'candidato' | 'empresa' | 'admin' | null {
    const user = this.getUser();
    return user?.type || null;
  }

  static logout(): void {
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.USER_KEY);
  }

  static async login(email: string, password: string, type: 'candidato' | 'empresa' | 'admin'): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, type }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        this.setAuth(data.user, data.token);
      }

      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  static async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        this.setAuth(data.user, data.token);
      }

      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor'
      };
    }
  }

  static getRedirectPath(userType: 'candidato' | 'empresa' | 'admin'): string {
    switch (userType) {
      case 'candidato':
        return '/candidato/dashboard';
      case 'empresa':
        return '/empresa/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  }

  // Método para obter headers com autenticação
  static getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Método para fazer requisições autenticadas
  static async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {})
    };

    return fetch(url, {
      ...options,
      headers
    });
  }
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT a ser verificado
 * @returns Dados decodificados do token ou null se inválido
 */
export function verifyToken(token: string): { userId: string; email?: string; name?: string; type?: string } | null {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-key-for-production-leao-careers-2024-mongodb-atlas-amplify';
    const decoded = jwt.verify(token, jwtSecret) as any;
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
} 