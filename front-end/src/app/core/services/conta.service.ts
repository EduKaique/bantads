import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../configs/api.token';
import {
  OperacaoResponse,
  TransferenciaRequest,
  TransferenciaResponse,
  SaldoResponse,
  ExtratoResponse,
  ContaPorCpfResponse,
  ContaPerfilResponse,
} from '../../shared/models/conta';

@Injectable({
  providedIn: 'root'
})
export class ContaService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  // GET /contas/cpf/{cpf}
  buscarContaPorCpf(cpf: string): Observable<ContaPorCpfResponse> {
    return this.http.get<ContaPorCpfResponse>(
      `${this.apiUrl}/contas/cpf/${cpf}`
    );
  }

  // GET /contas/{numero}
  buscarConta(numeroConta: string): Observable<ContaPerfilResponse> {
    return this.http.get<ContaPerfilResponse>(
      `${this.apiUrl}/contas/${numeroConta}`
    );
  }

  // POST /contas/{numero}/depositar
  depositar(numeroConta: string, valor: number): Observable<OperacaoResponse> {
    return this.http.post<OperacaoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/depositar`,
      { valor }
    );
  }

  // POST /contas/{numero}/sacar
  sacar(numeroConta: string, valor: number): Observable<OperacaoResponse> {
    return this.http.post<OperacaoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/sacar`,
      { valor }
    );
  }

  // POST /contas/{numero}/transferir
  transferir(numeroConta: string, request: TransferenciaRequest): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(
      `${this.apiUrl}/contas/${numeroConta}/transferir`,
      request
    );
  }

  // GET /contas/{numero}/saldo
  consultarSaldo(numeroConta: string): Observable<SaldoResponse> {
    return this.http.get<SaldoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/saldo`
    );
  }

  // GET /contas/{numero}/extrato
  consultarExtrato(numeroConta: string): Observable<ExtratoResponse> {
    return this.http.get<ExtratoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/extrato`
    );
  }
}