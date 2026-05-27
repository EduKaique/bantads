import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

import { ClienteService } from './cliente.service';
import { ContaService } from './conta.service';
import { GerentesService } from './gerentes.service';
import {
  ClienteResponse,
  DadosClienteResponse,
} from '../../shared/models/cliente.models';
import { Gerente } from '../../shared/models/gerente';
import {
  ClienteCarteira,
  ClienteDetalhado,
  ContaConsulta,
  InformacoesMelhorCliente,
  RelatorioCliente,
} from '../../shared/models/consultas-gerenciais';

type ClienteConsulta = DadosClienteResponse & Partial<ClienteResponse>;
type ValorNumerico = number | string | null | undefined;

@Injectable({
  providedIn: 'root',
})
export class ConsultasGerenciaisService {
  private readonly clienteService = inject(ClienteService);
  private readonly contaService = inject(ContaService);
  private readonly gerentesService = inject(GerentesService);

  listarRelatorioClientes(): Observable<RelatorioCliente[]> {
    return forkJoin({
      clientes: this.clienteService.listarRelatorioClientes(),
      gerentes: this.gerentesService.listar(),
    }).pipe(
      switchMap(({ clientes, gerentes }) =>
        this.criarMapaContasPorCliente(clientes).pipe(
          map((contasPorCliente) =>
            clientes
              .map((cliente) =>
                this.mapearRelatorioCliente(
                  cliente,
                  contasPorCliente.get(this.normalizarDocumento(cliente.cpf)),
                  gerentes,
                ),
              )
              .sort((atual, proximo) =>
                atual.nomeCliente.localeCompare(proximo.nomeCliente, 'pt-BR'),
              ),
          ),
        ),
      ),
    );
  }

  listarClientesDoGerente(cpfGerente: string): Observable<ClienteCarteira[]> {
    const cpfGerenteNormalizado = this.normalizarDocumento(cpfGerente);

    if (!cpfGerenteNormalizado) {
      return of([]);
    }

    return this.clienteService.listarTodosClientes().pipe(
      switchMap((clientes) =>
        this.criarMapaContasPorCliente(clientes).pipe(
          map((contasPorCliente) =>
            clientes
              .map((cliente) => ({
                cliente,
                conta: contasPorCliente.get(this.normalizarDocumento(cliente.cpf)),
              }))
              .filter(({ cliente, conta }) =>
                this.resolverCpfGerente(
                  conta,
                  cliente.cpfGerente,
                  cliente.cpfGerenteResponsavel,
                ) === cpfGerenteNormalizado,
              )
              .map(({ cliente, conta }) =>
                this.mapearClienteCarteira(cliente, conta),
              )
              .sort((atual, proximo) =>
                atual.nome.localeCompare(proximo.nome, 'pt-BR'),
              ),
          ),
        ),
      ),
    );
  }

  obterClienteDetalhadoPorCpf(cpf: string): Observable<ClienteDetalhado | null> {
    const cpfNormalizado = this.normalizarDocumento(cpf);

    if (!cpfNormalizado) {
      return of(null);
    }

    return forkJoin({
      cliente: this.clienteService.buscarClientePorCpf(cpfNormalizado),
      gerentes: this.gerentesService.listar(),
    }).pipe(
      switchMap(({ cliente, gerentes }) =>
        this.contaService.buscarPerfilContaPorCpf(cpfNormalizado).pipe(
          map((conta) => this.mapearClienteDetalhado(cliente, conta, gerentes)),
        ),
      ),
    );
  }

  listarMelhoresClientes(cpfGerente?: string): Observable<InformacoesMelhorCliente[]> {
    const cpfGerenteNormalizado =
      cpfGerente === undefined ? '' : this.normalizarDocumento(cpfGerente);

    if (cpfGerente !== undefined && !cpfGerenteNormalizado) {
      return of([]);
    }

    return this.clienteService.listarMelhoresClientes().pipe(
      switchMap((clientes) =>
        this.criarMapaContasPorCliente(clientes).pipe(
          map((contasPorCliente) =>
            clientes
              .map((cliente) => ({
                cliente,
                conta: contasPorCliente.get(this.normalizarDocumento(cliente.cpf)),
              }))
              .filter(
                ({ cliente, conta }) =>
                  (!!conta || this.temValorNumerico(cliente.saldo)) &&
                  (!cpfGerenteNormalizado ||
                    this.resolverCpfGerente(
                      conta,
                      cliente.cpfGerente,
                      cliente.cpfGerenteResponsavel,
                    ) === cpfGerenteNormalizado),
              )
              .map(({ cliente, conta }) =>
                this.mapearMelhorCliente(cliente, conta),
              )
              .sort((atual, proximo) => proximo.saldo - atual.saldo)
              .slice(0, 3),
          ),
        ),
      ),
    );
  }

  private criarMapaContasPorCliente(
    clientes: ClienteConsulta[],
  ): Observable<Map<string, ContaConsulta>> {
    const consultas = clientes
      .map((cliente) => this.normalizarDocumento(cliente.cpf))
      .filter((cpf) => !!cpf)
      .map((cpf) =>
        this.contaService.buscarPerfilContaPorCpf(cpf).pipe(
          map((conta) => ({
            cpf,
            conta,
          })),
        ),
      );

    if (consultas.length === 0) {
      return of(new Map<string, ContaConsulta>());
    }

    return forkJoin(consultas).pipe(
      map((respostas) => {
        const contasPorCliente = new Map<string, ContaConsulta>();

        respostas.forEach(({ cpf, conta }) => {
          if (conta) {
            contasPorCliente.set(cpf, conta);
          }
        });

        return contasPorCliente;
      }),
    );
  }

  private mapearRelatorioCliente(
    cliente: ClienteConsulta,
    conta: ContaConsulta | undefined,
    gerentes: Gerente[],
  ): RelatorioCliente {
    const cpfGerente = this.resolverCpfGerente(
      conta,
      cliente.cpfGerente,
      cliente.cpfGerenteResponsavel,
    );

    return {
      cpfCliente: this.normalizarDocumento(cliente.cpf) || '-',
      nomeCliente: this.resolverTexto(cliente.nome),
      emailCliente: this.resolverTexto(cliente.email),
      salario: this.resolverNumero(cliente.salario),
      numeroConta: this.resolverTexto(conta?.numero, conta?.accountNumber, cliente.numeroConta),
      saldo: this.resolverNumero(conta?.saldo, conta?.availableBalance, cliente.saldo),
      limite: this.resolverNumero(conta?.limite, conta?.limit, cliente.limite),
      cpfGerente: cpfGerente || '-',
      nomeGerente: this.resolverNomeGerente(cpfGerente, gerentes, conta, cliente.nomeGerente),
    };
  }

  private mapearClienteCarteira(
    cliente: ClienteConsulta,
    conta: ContaConsulta | undefined,
  ): ClienteCarteira {
    const cpfCliente = this.normalizarDocumento(cliente.cpf);
    const numeroConta = this.resolverTexto(conta?.numero, conta?.accountNumber, cliente.numeroConta);

    return {
      id: cliente.id !== undefined && cliente.id !== null ? String(cliente.id) : cpfCliente || numeroConta,
      cpf: cpfCliente || '-',
      nome: this.resolverTexto(cliente.nome, conta?.holderName),
      cidade: this.resolverTexto(cliente.cidade, cliente.endereco?.cidade, 'Nao informado'),
      estado: this.resolverTexto(cliente.estado, cliente.uf, cliente.endereco?.uf, 'Nao informado'),
      saldo: this.resolverNumero(conta?.saldo, conta?.availableBalance, cliente.saldo),
      limite: this.resolverNumero(conta?.limite, conta?.limit, cliente.limite),
      numeroConta,
    };
  }

  private mapearClienteDetalhado(
    cliente: ClienteConsulta,
    conta: ContaConsulta | null,
    gerentes: Gerente[],
  ): ClienteDetalhado {
    const cpfGerente = this.resolverCpfGerente(
      conta,
      cliente.cpfGerente,
      cliente.cpfGerenteResponsavel,
    );
    const nomeGerente = this.resolverNomeGerente(cpfGerente, gerentes, conta, cliente.nomeGerente);

    return {
      nome: this.resolverTexto(cliente.nome),
      cpf: this.normalizarDocumento(cliente.cpf) || '-',
      email: this.resolverTexto(cliente.email),
      celular: this.resolverTexto(cliente.celular, cliente.telefone, ''),
      endereco: {
        cep: this.resolverTexto(cliente.cep, cliente.endereco?.cep, ''),
        logradouro: this.resolverTexto(cliente.logradouro, cliente.endereco?.logradouro, ''),
        numero: this.resolverTexto(cliente.numero, cliente.endereco?.numero, ''),
        complemento: this.resolverTexto(cliente.complemento, cliente.endereco?.complemento, ''),
        bairro: this.resolverTexto(cliente.bairro, cliente.endereco?.bairro, ''),
        cidade: this.resolverTexto(cliente.cidade, cliente.endereco?.cidade, ''),
        uf: this.resolverTexto(cliente.estado, cliente.uf, cliente.endereco?.uf, ''),
      },
      salario: this.resolverNumero(cliente.salario),
      saldo: this.resolverNumero(conta?.saldo, conta?.availableBalance, cliente.saldo),
      limite: this.resolverNumero(conta?.limite, conta?.limit, cliente.limite),
      gerente: nomeGerente === '-' ? undefined : nomeGerente,
      managerDocument: cpfGerente || undefined,
    };
  }

  private mapearMelhorCliente(
    cliente: ClienteConsulta,
    conta: ContaConsulta | undefined,
  ): InformacoesMelhorCliente {
    return {
      nome: this.resolverTexto(cliente.nome, conta?.holderName, 'Nao informado'),
      cpf: this.normalizarDocumento(cliente.cpf) || this.resolverCpfCliente(conta) || '-',
      cidade: this.resolverTexto(cliente.cidade, cliente.endereco?.cidade, 'Nao informado'),
      estado: this.resolverTexto(cliente.estado, cliente.uf, cliente.endereco?.uf, 'Nao informado'),
      saldo: this.resolverNumero(conta?.saldo, conta?.availableBalance, cliente.saldo),
    };
  }

  private resolverNomeGerente(
    cpfGerente: string,
    gerentes: Gerente[],
    conta?: ContaConsulta | null,
    nomeGerente?: string,
  ): string {
    const gerente = gerentes.find(
      (item) => this.normalizarDocumento(item.cpf) === cpfGerente,
    );
    const nomeConta = this.pareceCpf(conta?.manager) ? undefined : conta?.manager;

    return this.resolverTexto(gerente?.nome, nomeGerente, nomeConta);
  }

  private resolverCpfCliente(conta?: ContaConsulta | null): string {
    return this.normalizarDocumento(conta?.cliente || conta?.holderDocument || '');
  }

  private resolverCpfGerente(
    conta?: ContaConsulta | null,
    ...candidatos: Array<string | null | undefined>
  ): string {
    const gerenteCompatibilidade = this.pareceCpf(conta?.manager) ? conta?.manager : undefined;
    const valores = [
      conta?.gerente,
      conta?.managerDocument,
      gerenteCompatibilidade,
      ...candidatos,
    ];

    for (const valor of valores) {
      const documento = this.normalizarDocumento(valor || '');

      if (documento) {
        return documento;
      }
    }

    return '';
  }

  private resolverTexto(
    ...valores: Array<string | number | null | undefined>
  ): string {
    for (const valor of valores) {
      if (valor === null || valor === undefined) {
        continue;
      }

      const texto = String(valor).trim();

      if (texto) {
        return texto;
      }
    }

    return '-';
  }

  private resolverNumero(...valores: ValorNumerico[]): number {
    for (const valor of valores) {
      const numero = this.converterNumero(valor);

      if (numero !== null) {
        return this.arredondar(numero);
      }
    }

    return 0;
  }

  private converterNumero(valor: ValorNumerico): number | null {
    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return valor;
    }

    if (typeof valor === 'string' && valor.trim()) {
      const numero = Number(valor.replace(/\./g, '').replace(',', '.'));

      if (Number.isFinite(numero)) {
        return numero;
      }
    }

    return null;
  }

  private temValorNumerico(valor: ValorNumerico): boolean {
    return this.converterNumero(valor) !== null;
  }

  private pareceCpf(valor: string | null | undefined): boolean {
    return this.normalizarDocumento(valor || '').length === 11;
  }

  private normalizarDocumento(valor: string): string {
    return valor.replace(/\D/g, '');
  }

  private arredondar(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }
}
