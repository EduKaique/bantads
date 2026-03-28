import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { BankAccount } from '../../../shared/models/bank-account';

interface DadosCliente {
  cpf: string;
  nome: string;
  email: string;
  celular: string;
  salario: number;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

export interface ClienteDetalhado {
  nome: string;
  cpf: string;
  email: string;
  celular: string;
  endereco: string;
  salario: string;
  saldo: string;
  limite: string;
}

@Injectable({
  providedIn: 'root',
})
export class DetalheClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  obterClienteDetalhadoPorCpf(cpf: string): Observable<ClienteDetalhado | null> {
    const cpfLimpo = cpf.replace(/\D/g, '');

    return forkJoin({
      clientes: this.http.get<DadosCliente[]>(`${this.apiUrl}/clientes`),
      contas: this.http.get<BankAccount[]>(`${this.apiUrl}/contas`),
    }).pipe(
      map(({ clientes, contas }) => {
        const cliente = clientes.find((clienteAtual) => clienteAtual.cpf === cpfLimpo);

        if (!cliente) {
          return null;
        }

        const conta = contas.find((contaAtual) => contaAtual.holderDocument === cpfLimpo);
        const endereco = `${cliente.endereco.logradouro}, ${cliente.endereco.numero}${cliente.endereco.complemento ? `, ${cliente.endereco.complemento}` : ''}\nBairro ${cliente.endereco.bairro}\n${cliente.endereco.cidade} - ${cliente.endereco.uf}\n${cliente.endereco.cep}`;

        return {
          nome: cliente.nome,
          cpf: cliente.cpf,
          email: cliente.email,
          celular: cliente.celular,
          endereco,
          salario: this.formatarMoeda(cliente.salario),
          saldo: this.formatarMoeda(conta?.availableBalance || 0),
          limite: this.formatarMoeda(conta?.limit || 0),
        };
      }),
    );
  }

  private formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
