import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { API_URL } from '../configs/api.token';
import {
  AprovacaoClienteResponse,
  AutocadastroInfo,
  CpfDuplicadoError,
  ContaClienteResponse,
  DadosClienteResponse,
  FILTRO_CLIENTES,
  PerfilInfo,
  RelatorioClientesResponse,
  RespostaAprovacaoClienteResponse,
  TodosClientesResponse,
  ParaAprovarResponse,
} from '../../shared/models/cliente.models';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  criarCliente(dadosAutocadastro: AutocadastroInfo): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/clientes`, dadosAutocadastro)
      .pipe(catchError((erro) => this.tratarErroCriacao(erro)));
  }

  buscarClientePorCpf(cpf: string): Observable<DadosClienteResponse> {
    return this.http.get<DadosClienteResponse>(
      `${this.apiUrl}/clientes/${this.normalizarCpf(cpf)}`,
    );
  }

  atualizarPerfil(cpf: string, perfil: PerfilInfo): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/clientes/${this.normalizarCpf(cpf)}`,
      perfil,
    );
  }

  buscarContaPorCpf(cpf: string): Observable<ContaClienteResponse> {
    return this.http.get<ContaClienteResponse>(
      `${this.apiUrl}/contas/cpf/${this.normalizarCpf(cpf)}`,
    );
  }

  listarParaAprovar(cpfGerente?: string): Observable<ParaAprovarResponse> {
    let params = new HttpParams().set('filtro', FILTRO_CLIENTES.paraAprovar);

    if (cpfGerente) {
      params = params.set('cpfGerente', this.normalizarCpf(cpfGerente));
    }

    return this.http.get<ParaAprovarResponse>(`${this.apiUrl}/clientes`, {
      params,
    });
  }

  listarRelatorioClientes(): Observable<RelatorioClientesResponse> {
    const params = new HttpParams().set(
      'filtro',
      FILTRO_CLIENTES.relatorioAdministrativo,
    );

    return this.http.get<RelatorioClientesResponse>(
      `${this.apiUrl}/clientes`,
      { params },
    );
  }

  listarMelhoresClientes(): Observable<TodosClientesResponse> {
    const params = new HttpParams().set(
      'filtro',
      FILTRO_CLIENTES.melhoresClientes,
    );

    return this.http.get<TodosClientesResponse>(`${this.apiUrl}/clientes`, {
      params,
    });
  }

  listarTodosClientes(): Observable<TodosClientesResponse> {
    return this.http.get<TodosClientesResponse>(`${this.apiUrl}/clientes`);
  }

  aprovarCliente(cpf: string): Observable<AprovacaoClienteResponse> {
    return this.http.post<AprovacaoClienteResponse>(
      `${this.apiUrl}/clientes/${this.normalizarCpf(cpf)}/aprovar`,
      {},
    );
  }

  consultarAprovacao(
    idSaga: string,
  ): Observable<RespostaAprovacaoClienteResponse> {
    return this.http.get<RespostaAprovacaoClienteResponse>(
      `${this.apiUrl}/clientes/aprovacoes/${idSaga}`,
    );
  }

  rejeitarCliente(cpf: string, motivo: string): Observable<void> {
    const motivoNormalizado = motivo.trim();

    if (!motivoNormalizado) {
      return throwError(
        () => new Error('Informe um motivo para rejeitar o cliente.'),
      );
    }

    return this.http.post<void>(
      `${this.apiUrl}/clientes/${this.normalizarCpf(cpf)}/rejeitar`,
      { motivo: motivoNormalizado },
    );
  }

  private tratarErroCriacao(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return throwError(() => new CpfDuplicadoError());
    }

    return throwError(() => error);
  }

  private normalizarCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }
}
