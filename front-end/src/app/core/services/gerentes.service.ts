import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, throwError } from 'rxjs';

import { API_URL } from '../configs/api.token';
import {
  DadoGerente,
  DadoGerenteAtualizacao,
  DadoGerenteInsercao,
  DashboardResponse,
  Gerente,
  GerentesResponse,
} from '../../shared/models/gerente';

@Injectable({
  providedIn: 'root',
})
export class GerentesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listar(): Observable<GerentesResponse>;
  listar(numero: number): Observable<DashboardResponse>;
  listar(numero?: number): Observable<GerentesResponse | DashboardResponse> {
    const params = this.criarParametrosListagem(numero);

    if (params instanceof Error) {
      return throwError(() => params);
    }

    if (numero !== undefined) {
      return this.http
        .get<DashboardResponse>(`${this.apiUrl}/gerentes`, { params })
        .pipe(
          map((itens) =>
            itens.map((item) => ({
              ...item,
              celular: item.celular ?? '',
            })),
          ),
        );
    }

    return this.http.get<DadoGerente[]>(`${this.apiUrl}/gerentes`).pipe(
      map((gerentes) =>
        gerentes
          .map((gerente) => this.mapearGerente(gerente))
          .sort((gerenteA, gerenteB) =>
            gerenteA.nome.localeCompare(gerenteB.nome, 'pt-BR'),
          ),
      ),
    );
  }

  buscarPorCpf(cpf: string): Observable<Gerente> {
    return this.http
      .get<DadoGerente>(`${this.apiUrl}/gerentes/${cpf}`)
      .pipe(map((gerente) => this.mapearGerente(gerente)));
  }

  inserir(dadosGerente: DadoGerenteInsercao): Observable<Gerente> {
    return this.http
      .post<DadoGerente>(`${this.apiUrl}/gerentes`, dadosGerente)
      .pipe(map((gerente) => this.mapearGerente(gerente)));
  }

  atualizar(
    cpf: string,
    dadosGerente: DadoGerenteAtualizacao,
  ): Observable<Gerente> {
    return this.http
      .put<DadoGerente>(`${this.apiUrl}/gerentes/${cpf}`, dadosGerente)
      .pipe(map((gerente) => this.mapearGerente(gerente)));
  }

  remover(cpf: string): Observable<Gerente> {
    return this.http
      .delete<DadoGerente>(`${this.apiUrl}/gerentes/${cpf}`)
      .pipe(map((gerente) => this.mapearGerente(gerente)));
  }

  private criarParametrosListagem(numero?: number): HttpParams | Error {
    if (numero === undefined) {
      return new HttpParams();
    }

    if (!Number.isInteger(numero) || numero <= 0) {
      return new Error('O parametro numero deve ser um inteiro positivo.');
    }

    return new HttpParams().set('numero', String(numero));
  }

  private mapearGerente(gerente: DadoGerente): Gerente {
    const gerenteMapeado: Gerente = {
      cpf: gerente.cpf,
      nome: gerente.nome,
      email: gerente.email,
      celular: gerente.celular ?? '',
    };

    if (gerente.tipo) {
      gerenteMapeado.tipo = gerente.tipo;
    }

    return gerenteMapeado;
  }
}
