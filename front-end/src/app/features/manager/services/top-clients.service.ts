import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { BankAccount } from '../../../shared/models/bank-account';

export interface DadosCliente {
  cpf: string;
  nome: string;
  endereco: {
    cidade: string;
    uf: string;
  };
}

export interface InfoMelhorCliente {
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
export class MelhoresClientesService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  obter3MelhoresClientes(): Observable<InfoMelhorCliente[]> {
    return forkJoin({
      contas: this.http.get<BankAccount[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<DadosCliente[]>(`${this.apiUrl}/clientes`),
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
