import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { BankAccount } from '../../../shared/models/bank-account';

interface DadosCliente {
  cpf: string;
  nome: string;
  endereco: {
    cidade: string;
    uf: string;
  };
}

export interface InformacoesMelhorCliente {
  nome: string;
  cpf: string;
  cidade: string;
  estado: string;
  saldo: number;
}

@Injectable({
  providedIn: 'root',
})
export class MelhoresClientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  obter3MelhoresClientes(): Observable<InformacoesMelhorCliente[]> {
    return forkJoin({
      contas: this.http.get<BankAccount[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<DadosCliente[]>(`${this.apiUrl}/clientes`),
    }).pipe(
      map(({ contas, clientes }) => {
        const melhoresContas = contas
          .sort(
            (contaAtual, proximaConta) =>
              (proximaConta.availableBalance || 0) - (contaAtual.availableBalance || 0),
          )
          .slice(0, 3);

        return melhoresContas.map((conta) => {
          const cliente = clientes.find(
            (clienteAtual) => clienteAtual.cpf === conta.holderDocument,
          );

          return {
            nome: cliente?.nome || conta.holderName,
            cpf: conta.holderDocument,
            cidade: cliente?.endereco?.cidade || 'Não informado',
            estado: cliente?.endereco?.uf || 'Não informado',
            saldo: conta.availableBalance || 0,
          };
        });
      }),
    );
  }
}
