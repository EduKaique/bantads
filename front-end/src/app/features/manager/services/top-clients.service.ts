import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { BankAccount } from '../../../shared/models/bank-account';

export interface ClientData {
  cpf: string;
  nome: string;
  endereco: {
    cidade: string;
    uf: string;
  };
}

export interface TopClientInfo {
  nome: string;
  cpf: string;
  cidade: string;
  estado: string;
  saldo: number;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TopClientsService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getTop3Clients(): Observable<TopClientInfo[]> {
    return forkJoin({
      contas: this.http.get<BankAccount[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<ClientData[]>(`${this.apiUrl}/clientes`),
    }).pipe(
      map(({ contas, clientes }) => {
        const topContas = contas
          .sort((a, b) => (b.availableBalance || 0) - (a.availableBalance || 0))
          .slice(0, 3);

        return topContas.map((conta) => {
          const cliente = clientes.find((c) => c.cpf === conta.holderDocument);
          return {
            nome: cliente?.nome || conta.holderName,
            cpf: conta.holderDocument,
            cidade: cliente?.endereco?.cidade || 'N/A',
            estado: cliente?.endereco?.uf || 'N/A',
            saldo: conta.availableBalance || 0,
          };
        });
      })
    );
  }
}
