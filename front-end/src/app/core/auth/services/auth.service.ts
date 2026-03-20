import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { API_URL } from '../../configs/api.token';
import { RegisterRequest } from '../models/register-request';

interface LoginResponse {
  access_token: string;
  token_type: string;
  tipo: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    cpf: string;
  };
}

export type UserState = {
  id?: number;
  nome: string;
  email?: string;
  cpf?: string;
  tipo: 'cliente' | 'gerente' | 'administrador';
  access_token: string;
} | null;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiBaseUrl = inject(API_URL);
  private router = inject(Router);

  private userSignal = signal<UserState | null>(this.getUserFromStorage());

  public currentUser = this.userSignal.asReadonly();

  public isLoggedIn = computed(() => !!this.userSignal());

  public get currentUserValue(): UserState | null {
    return this.userSignal();
  }

  private getUserFromStorage(): UserState | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  public updateUser(user: UserState): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSignal.set(user);
  }

  constructor() {
    this.loadInitialUser();
  }

  private loadInitialUser(): UserState | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (e) {
        console.error('Erro ao carregar usuário', e);
        this.logout();
      }
    }
    return null;
  }

  public login(email: string, password: string): Observable<UserState> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        map((response) => {
          const user: UserState = {
            id: response.usuario.id,
            nome: response.usuario.nome,
            email: response.usuario.email,
            cpf: response.usuario.cpf,
            tipo: response.tipo.toLowerCase() as 'cliente' | 'gerente' | 'administrador',
            access_token: response.access_token,
          };
          return user;
        }),
        tap((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', user.access_token); 
          this.userSignal.set(user); 
        })
      );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Realiza o cadastro de um novo cliente.
   * @param data Objeto com dados pessoais e endereço
   */
  public signup(data: RegisterRequest): Observable<void> {
    console.log('Dados enviados para cadastro:', data);
    return this.http.post<void>(`${this.apiBaseUrl}/auth/register`, data);
  }

}
