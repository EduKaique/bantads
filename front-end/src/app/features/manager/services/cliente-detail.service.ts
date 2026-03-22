import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { BankAccount } from '../../../shared/models/bank-account';

export interface ClienteData {
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
export class ClienteDetailService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getClienteDetailByCpf(cpf: string): Observable<ClienteDetalhado | null> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    return forkJoin({
      clientes: this.http.get<ClienteData[]>(`${this.apiUrl}/clientes`),
      contas: this.http.get<BankAccount[]>(`${this.apiUrl}/contas`),
    }).pipe(
      map(({ clientes, contas }) => {
        const cliente = clientes.find((c) => c.cpf === cpfLimpo);
        if (!cliente) {
          return null;
        }

        const conta = contas.find((c) => c.holderDocument === cpfLimpo);

        const endereco = `${cliente.endereco.logradouro}, ${cliente.endereco.numero}${cliente.endereco.complemento ? ', ' + cliente.endereco.complemento : ''}
Bairro ${cliente.endereco.bairro}
${cliente.endereco.cidade} - ${cliente.endereco.uf}
${cliente.endereco.cep}`;

        return {
          nome: cliente.nome,
          cpf: cliente.cpf,
          email: cliente.email,
          celular: cliente.celular,
          endereco: endereco,
          salario: this.formatarCurrency(cliente.salario),
          saldo: conta ? this.formatarCurrency(conta.availableBalance || 0) : 'R$ 0,00',
          limite: conta ? this.formatarCurrency(conta.limit || 0) : 'R$ 0,00',
        };
      })
    );
  }

  private formatarCurrency(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
