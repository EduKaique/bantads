import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { API_URL } from '../../configs/api.token';
import { RegisterRequest } from '../models/register-request';
import {
  hasScopedStoragePrefix,
  PREFIXO_FILTRO_EXTRATO,
  PREFIXO_PRIMEIRO_ACESSO_EXTRATO,
} from '../../../shared/utils/session-storage.utils';

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
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_URL);
  private readonly router = inject(Router);
  private readonly userSignal = signal<UserState | null>(this.loadInitialUser());

  public currentUser = this.userSignal.asReadonly();

  public isLoggedIn = computed(() => !!this.userSignal());

  public get currentUserValue(): UserState | null {
    return this.userSignal();
  }

  public updateUser(user: UserState): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSignal.set(user);
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
        }),
      );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.limparMarcadoresDeSessaoDoExtrato();
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  private limparMarcadoresDeSessaoDoExtrato(): void {
    const chavesParaRemover: string[] = [];

    for (let indice = 0; indice < sessionStorage.length; indice++) {
      const chave = sessionStorage.key(indice);

      if (!chave) {
        continue;
      }

      if (
        hasScopedStoragePrefix(chave, PREFIXO_PRIMEIRO_ACESSO_EXTRATO) ||
        hasScopedStoragePrefix(chave, PREFIXO_FILTRO_EXTRATO)
      ) {
        chavesParaRemover.push(chave);
      }
    }

    chavesParaRemover.forEach((chave) => sessionStorage.removeItem(chave));
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
