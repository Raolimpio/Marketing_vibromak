import axios from './api';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';

export interface UserProfile {
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  createdAt: Date;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: UserProfile;
  token: string;
}

const TOKEN_KEY = '@sistema-vendas:token';
const USER_KEY = '@sistema-vendas:user';

class AuthService {
  private token: string | null = null;
  private user: UserProfile | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error) {
        console.error('Erro ao parsear usuário:', error);
      }
    }
  }

  async login({ email, password, rememberMe = false }: LoginCredentials): Promise<LoginResponse> {
    // Usar os dados do usuário atual do Firebase
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error('Usuário não autenticado no Firebase');
    }

    const mockUser: UserProfile = {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
      role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
      isAdmin: firebaseUser.email?.includes('admin') || false,
      createdAt: new Date()
    };

    const mockToken = await firebaseUser.getIdToken();

    this.token = mockToken;
    this.user = mockUser;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, mockToken);
    storage.setItem(USER_KEY, JSON.stringify(mockUser));

    return {
      user: mockUser,
      token: mockToken
    };
  }

  async logout(): Promise<void> {
    await auth.signOut();
    this.token = null;
    this.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    if (!this.user) {
      this.user = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
        role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
        isAdmin: firebaseUser.email?.includes('admin') || false,
        createdAt: new Date()
      };

      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(this.user));
    }

    return this.user;
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('Usuário não autenticado');

    // Atualiza apenas os campos fornecidos
    this.user = {
      ...this.user!,
      ...profile
    };

    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(this.user));

    return this.user;
  }

  isAuthenticated(): boolean {
    return !!auth.currentUser && !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();
