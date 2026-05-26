import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { AuthService } from '../../../core/auth/services/auth.service';
import { BankAccount } from '../../../shared/models/bank-account';
import { ClienteService } from '../../../core/services/cliente.service';
import { DadosClienteResponse } from '../../../shared/models/cliente.models';

export interface ClienteDetalhado {
  nome: string;
  cpf: string;
  email: string;
  celular: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  salario: string;
  saldo: string;
  limite: string;
  managerDocument?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DetalheClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly authService = inject(AuthService);
  private readonly clienteService = inject(ClienteService);

  obterClienteDetalhadoPorCpf(cpf: string): Observable<ClienteDetalhado | null> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const cpfGerente = this.authService.currentUserValue?.cpf?.replace(/\D/g, '') || '';

    return forkJoin({
      clientes: this.clienteService.listarTodosClientes(),
      contas: cpfGerente
        ? this.http.get<BankAccount[]>(`${this.apiUrl}/contas/gerente/${cpfGerente}`)
        : of([] as BankAccount[]),
    }).pipe(
      map(({ clientes, contas }) => {
        const cliente = clientes.find((clienteAtual) => clienteAtual.cpf === cpfLimpo);

        if (!cliente) {
          return null;
        }

        const conta = contas.find((contaAtual) => contaAtual.holderDocument === cpfLimpo);

        return {
          nome: cliente.nome,
          cpf: cliente.cpf,
          email: cliente.email,
          celular: cliente.celular || cliente.telefone || '',
          endereco: this.obterEndereco(cliente),
          salario: this.formatarMoeda(cliente.salario || 0),
          saldo: this.formatarMoeda(conta?.availableBalance || 0),
          limite: this.formatarMoeda(conta?.limit || 0),
          managerDocument: conta?.managerDocument || ''
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

  private obterEndereco(cliente: DadosClienteResponse): ClienteDetalhado['endereco'] {
    return {
      cep: cliente.cep || cliente.endereco?.cep || '',
      logradouro: cliente.logradouro || cliente.endereco?.logradouro || '',
      numero: cliente.numero || cliente.endereco?.numero || '',
      complemento: cliente.complemento || cliente.endereco?.complemento || '',
      bairro: cliente.bairro || cliente.endereco?.bairro || '',
      cidade: cliente.cidade || cliente.endereco?.cidade || '',
      uf: cliente.estado || cliente.uf || cliente.endereco?.uf || '',
    };
  }
}
