import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';

import { API_URL } from '../../../core/configs/api.token';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { BankAccount } from '../../../shared/models/bank-account';
import { ClienteResponse } from '../../../shared/models/cliente.models';

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
  private readonly authService = inject(AuthService);
  private readonly clienteService = inject(ClienteService);

  obter3MelhoresClientes(): Observable<InformacoesMelhorCliente[]> {
    const cpfGerente = this.authService.currentUserValue?.cpf?.replace(/\D/g, '') || '';

    return forkJoin({
      contas: cpfGerente
        ? this.http.get<BankAccount[]>(`${this.apiUrl}/contas/gerente/${cpfGerente}`)
        : of([] as BankAccount[]),
      clientes: this.clienteService.listarMelhoresClientes(),
    }).pipe(
      map(({ contas, clientes }) => {
        const melhoresContas = contas
          .sort(
            (contaAtual, proximaConta) =>
              (proximaConta.availableBalance || 0) -
              (contaAtual.availableBalance || 0),
          )
          .slice(0, 3);

        return melhoresContas.map((conta) => {
          const cliente = clientes.find(
            (clienteAtual) => clienteAtual.cpf === conta.holderDocument,
          );

          return {
            nome: cliente?.nome || conta.holderName,
            cpf: conta.holderDocument,
            cidade: this.resolverCidade(cliente),
            estado: this.resolverEstado(cliente),
            saldo: conta.availableBalance || 0,
          };
        });
      }),
    );
  }

  private resolverCidade(cliente?: ClienteResponse): string {
    return cliente?.cidade || cliente?.endereco?.cidade || 'Nao informado';
  }

  private resolverEstado(cliente?: ClienteResponse): string {
    return cliente?.estado || cliente?.uf || cliente?.endereco?.uf || 'Nao informado';
  }
}
