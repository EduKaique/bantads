import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { API_URL } from '../../configs/api.token';
import {
  hasScopedStoragePrefix,
  PREFIXO_FILTRO_EXTRATO,
  PREFIXO_PRIMEIRO_ACESSO_EXTRATO,
} from '../../../shared/utils/session-storage.utils';
import { LoginResponse, LogoutResponse, UserState } from '../models/auth.models';

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
        this.clearLocalSession();
      }
    }
    return null;
  }

  /**
   * Realiza o login do usuário.
   * @param login 
   * @param senha 
   * @returns Observable com os dados do usuário e token de acesso, ou erro 401 em caso de falha de autenticação. 
   */
  public login(login: string, senha: string): Observable<UserState> {
    return this.http
      .post<LoginResponse>(`${this.apiBaseUrl}/login`, { login, senha })
      .pipe(
        map((response) => {
          const user: UserState = {
            nome: response.usuario.nome,
            email: response.usuario.email,
            cpf: response.usuario.cpf,
            tipo: response.tipo as 'CLIENTE' | 'GERENTE' | 'ADMINISTRADOR',
            access_token: response.access_token,
          };
          return user;
        }),
        tap((user) => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', user.access_token);
          this.userSignal.set(user);
        }),
        catchError(this.handleAuthError) 
      );
  }

  /**
   * Realiza o logout do usuário.
   * @returns Observable com os dados de logout ou erro.
   */
  public logout(): Observable<LogoutResponse> {
    const token = localStorage.getItem('token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http
      .post<LogoutResponse>(`${this.apiBaseUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearLocalSession();
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          this.clearLocalSession();
          this.router.navigate(['/login']);
          return this.handleAuthError(error);
        })
      );
  }

  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401) {
      console.error('Erro 401: Acesso não autorizado.');
      return throwError(() => new Error('Credenciais incorretas ou sessão expirada.'));
    }
    return throwError(() => new Error('Ocorreu um erro no servidor. Tente novamente mais tarde.'));
  }

  private clearLocalSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.limparMarcadoresDeSessaoDoExtrato();
    this.userSignal.set(null);
  }

  private limparMarcadoresDeSessaoDoExtrato(): void {
    const chavesParaRemover: string[] = [];

    for (let indice = 0; indice < sessionStorage.length; indice++) {
      const chave = sessionStorage.key(indice);
      if (!chave) continue;

      if (
        hasScopedStoragePrefix(chave, PREFIXO_PRIMEIRO_ACESSO_EXTRATO) ||
        hasScopedStoragePrefix(chave, PREFIXO_FILTRO_EXTRATO)
      ) {
        chavesParaRemover.push(chave);
      }
    }

    chavesParaRemover.forEach((chave) => sessionStorage.removeItem(chave));
  }

}