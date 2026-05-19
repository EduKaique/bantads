import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { HttpClient } from '@angular/common/http';

export interface SaqueRequest {
  contaOrigem: string;
  valor: number;
}

export interface SaqueResponse {
  message: string;
  novoSaldoOrigem: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaqueService {

  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_URL);

  realizarSaque(request: SaqueRequest): Observable<SaqueResponse> {
    return this.http.post<SaqueResponse>(`${this.apiBaseUrl}/transacoes/saque`, request);
  }
}