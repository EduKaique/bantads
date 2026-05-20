//ESTE ARQUIVO SERÁ EXCLUÍDO APÓS SUCESSO NA INTEGRAÇÃO COM O BACKEND VIA conta.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
  throwError,
} from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { AccountTransaction } from '../../../shared/models/account-transaction';
import { BankAccount } from '../../../shared/models/bank-account';
import { DepositRequest } from '../../../shared/models/deposit-request';
import {
  createDepositTransaction,
  createMockClientAccount,
} from './client-account.factory';
import {
  PREFIXO_ARMAZENAMENTO_CONTA_CLIENTE,
  buildScopedStorageKey,
} from '../../../shared/utils/session-storage.utils';

interface ContaAtualMock {
  numeroConta: string;
  saldoDisponivel: number;
  limite?: number;
  manager?: string | null;
}

interface RespostaContaTransferenciaPorCpf {
  numeroConta: string;
  saldo?: number | string | null;
  saldoDisponivel?: number | string | null;
  limite?: number | string | null;
}

interface RespostaContaTransferenciaPerfil {
  cliente?: string | null;
  cpf?: string | null;
  nome?: string | null;
  numero?: string | null;
  numeroConta?: string | null;
  saldo?: number | string | null;
  saldoDisponivel?: number | string | null;
  limite?: number | string | null;
}

interface RespostaTransferenciaMock {
  message?: string;
  novoSaldoOrigem?: number | string | null;
  conta?: string;
  data?: string;
  destino?: string;
  saldo?: number | string | null;
  valor?: number | string | null;
  transacao?: {
    dataHora?: string;
  };
}

interface RespostaDepositoMock {
  novoSaldoDestino: number;
  transacao?: {
    dataHora?: string;
  };
}

export interface ContaOrigemTransferencia {
  numeroConta: string;
  saldoDisponivel: number;
}

export interface ContaTransferenciaPerfil {
  cliente: string;
  nome: string;
  numero: string;
  saldo: number;
  limite: number;
  saldoDisponivel: number;
}

export interface TransferenciaRequest {
  destino: string;
  valor: number;
}

export interface TransferenciaResponse {
  conta: string;
  data: string;
  destino: string;
  saldo: number;
  valor: number;
}

export interface TransacaoExtratoMock {
  id: string;
  dataHora: string;
  tipo: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA';
  contaOrigem: string | null;
  nomeOrigem?: string | null;
  contaDestino: string | null;
  nomeDestino?: string | null;
  valor: number;
}

export interface ExtratoAtualMock {
  numeroConta: string;
  nomeTitular: string;
  saldoAtual: number;
  transacoes: TransacaoExtratoMock[];
}

@Injectable({
  providedIn: 'root',
})
export class ClientAccountService {
  private readonly mockApiUrl = 'http://localhost:3000';
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly accountStateSubject = new BehaviorSubject<BankAccount>(
    this.loadAccountState(),
  );

  readonly account$ = this.accountStateSubject.asObservable();

  constructor() {
    this.sincronizarContaComMock();
  }

  getCurrentAccount(): Observable<BankAccount> {
    this.sincronizarContaComMock();
    return this.account$;
  }

  getExtratoAtual(): Observable<ExtratoAtualMock> {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf || currentUser.tipo !== 'cliente') {
      return throwError(
        () => new Error('Apenas clientes podem consultar o extrato.'),
      );
    }

    return this.account$.pipe(
      switchMap((contaLocal) =>
        this.buscarContaAtualNoMock().pipe(
          switchMap((contaAtual) =>
            this.http
              .get<TransacaoExtratoMock[]>(
                `${this.mockApiUrl}/transacoes/cpf/${currentUser.cpf}`,
              )
              .pipe(
                map((transacoes) => ({
                  numeroConta: contaAtual.numeroConta,
                  nomeTitular: contaLocal.holderName || this.resolveHolderName(),
                  saldoAtual: contaAtual.saldoDisponivel,
                  transacoes,
                })),
              ),
          ),
        ),
      ),
    );
  }

  depositIntoCurrentAccount(request: DepositRequest): Observable<BankAccount> {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.tipo !== 'cliente') {
      return throwError(
        () => new Error('Apenas clientes podem realizar depositos.'),
      );
    }

    try {
      const amount = this.validateAmount(request.amount);
      const description = request.description?.trim() || 'Deposito em conta';

      return this.buscarContaAtualNoMock().pipe(
        switchMap((contaAtual) =>
          this.http
            .post<RespostaDepositoMock>(`${this.mockApiUrl}/transacoes/deposito`, {
              contaDestino: contaAtual.numeroConta,
              valor: amount,
            })
            .pipe(
              map((resposta) => {
                const contaAtualLocal = this.accountStateSubject.value;
                const balanceAfter =
                  typeof resposta.novoSaldoDestino === 'number'
                    ? resposta.novoSaldoDestino
                    : this.roundCurrency(
                        contaAtualLocal.availableBalance + amount,
                      );

                const transaction = createDepositTransaction({
                  amount,
                  balanceAfter,
                  description,
                  performedAt: resposta.transacao?.dataHora,
                });

                const updatedAccount: BankAccount = {
                  ...contaAtualLocal,
                  accountNumber:
                    contaAtual.numeroConta || contaAtualLocal.accountNumber,
                  holderDocument:
                    currentUser?.cpf || contaAtualLocal.holderDocument,
                  holderName: this.resolveHolderName(),
                  availableBalance: balanceAfter,
                  limit: contaAtual.limite ?? contaAtualLocal.limit,
                  manager: contaAtual.manager || contaAtualLocal.manager,
                  transactions: [transaction, ...contaAtualLocal.transactions],
                };

                this.persistAccountState(updatedAccount);
                this.accountStateSubject.next(updatedAccount);

                return updatedAccount;
              }),
            ),
        ),
      );
    } catch (error) {
      return throwError(() =>
        error instanceof Error
          ? error
          : new Error('Nao foi possivel processar o deposito.'),
      );
    }
  }

  withdrawFromCurrentAccount(request: {
    amount: number;
    description?: string;
  }): Observable<BankAccount> {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.tipo !== 'cliente') {
      return throwError(
        () => new Error('Apenas clientes podem realizar saques.'),
      );
    }

    try {
      const amount = this.validateAmount(request.amount);
      const currentAccount = this.accountStateSubject.value;
      const limit = (currentAccount as any).limit || 0;
      const availableToWithdraw = currentAccount.availableBalance + limit;

      if (amount > availableToWithdraw) {
        return throwError(() => new Error('Saldo insuficiente para este saque.'));
      }

      const balanceAfter = this.roundCurrency(
        currentAccount.availableBalance - amount,
      );

      const transaction: AccountTransaction = {
        id: Math.random().toString(36).substring(2, 10),
        type: 'saque',
        amount: amount,
        description: request.description?.trim() || 'Saque em conta',
        performedAt: new Date().toISOString(),
        balanceAfter: balanceAfter,
      } as AccountTransaction;

      const updatedAccount: BankAccount = {
        ...currentAccount,
        availableBalance: balanceAfter,
        transactions: [transaction, ...currentAccount.transactions],
      };

      this.persistAccountState(updatedAccount);
      this.accountStateSubject.next(updatedAccount);

      return of(updatedAccount);
    } catch (error) {
      return throwError(() =>
        error instanceof Error
          ? error
          : new Error('Nao foi possivel processar o saque.'),
      );
    }
  }

  buscarContaOrigemTransferenciaPorCpf(
    cpf: string,
  ): Observable<ContaOrigemTransferencia> {
    return this.http
      .get<RespostaContaTransferenciaPorCpf>(
        `${this.mockApiUrl}/contas/cpf/${cpf}`,
      )
      .pipe(
        switchMap((contaPorCpf) => {
          const saldo = contaPorCpf.saldo ?? contaPorCpf.saldoDisponivel;

          if (
            this.temValorMonetario(saldo) ||
            this.temValorMonetario(contaPorCpf.limite)
          ) {
            return of({
              numeroConta: contaPorCpf.numeroConta,
              saldoDisponivel: this.calcularSaldoDisponivel(
                saldo,
                contaPorCpf.limite,
              ),
            });
          }

          return this.buscarContaTransferenciaPorNumero(
            contaPorCpf.numeroConta,
          ).pipe(
            map((detalhesConta) => ({
              numeroConta: contaPorCpf.numeroConta,
              saldoDisponivel: detalhesConta.saldoDisponivel,
            })),
          );
        }),
      );
  }

  buscarContaTransferenciaPorNumero(
    numeroConta: string,
  ): Observable<ContaTransferenciaPerfil> {
    return this.http
      .get<RespostaContaTransferenciaPerfil>(
        `${this.mockApiUrl}/contas/${numeroConta}`,
      )
      .pipe(
        map((dadosConta) => {
          const saldo = this.toCurrencyNumber(
            dadosConta.saldo ?? dadosConta.saldoDisponivel,
          );
          const limite = this.toCurrencyNumber(dadosConta.limite);
          const numero =
            dadosConta.numero || dadosConta.numeroConta || numeroConta;

          return {
            cliente: dadosConta.cliente || dadosConta.cpf || '',
            nome: dadosConta.nome || 'Conta identificada',
            numero,
            saldo,
            limite,
            saldoDisponivel: this.calcularSaldoDisponivel(saldo, limite),
          };
        }),
      );
  }

  transferirEntreContas(
    numeroContaOrigem: string,
    request: TransferenciaRequest,
  ): Observable<TransferenciaResponse> {
    return this.http
      .post<RespostaTransferenciaMock>(
        `${this.mockApiUrl}/transacoes/transferir`,
        {
          contaOrigem: numeroContaOrigem,
          contaDestino: request.destino,
          valor: request.valor,
        },
      )
      .pipe(
        switchMap((resposta) =>
          this.buscarSaldoOrigemAposTransferencia(resposta).pipe(
            map((saldoDisponivelOrigem) => ({
              conta: resposta.conta || numeroContaOrigem,
              data:
                resposta.data ||
                resposta.transacao?.dataHora ||
                new Date().toISOString(),
              destino: resposta.destino || request.destino,
              saldo: saldoDisponivelOrigem,
              valor: this.toCurrencyNumber(resposta.valor ?? request.valor),
            })),
          ),
        ),
      );
  }

  calcularSaldoDisponivel(
    saldo: number | string | null | undefined,
    limite: number | string | null | undefined,
  ): number {
    return this.roundCurrency(
      this.toCurrencyNumber(saldo) + this.toCurrencyNumber(limite),
    );
  }

  private loadAccountState(): BankAccount {
    const storageKey = this.buildStorageKey();
    const persistedState = localStorage.getItem(storageKey);

    if (persistedState) {
      try {
        const parsedState: unknown = JSON.parse(persistedState);

        if (this.isBankAccount(parsedState)) {
          return parsedState;
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    const seedAccount = createMockClientAccount(this.resolveHolderName());
    this.persistAccountState(seedAccount);

    return seedAccount;
  }

  private persistAccountState(account: BankAccount): void {
    localStorage.setItem(this.buildStorageKey(), JSON.stringify(account));
  }

  private sincronizarContaComMock(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf || currentUser.tipo !== 'cliente') {
      return;
    }

    this.buscarContaAtualNoMock()
      .pipe(catchError(() => of(null)))
      .subscribe((contaAtual) => {
        if (!contaAtual) {
          return;
        }

        const contaLocal = this.accountStateSubject.value;
        const contaSincronizada: BankAccount = {
          ...contaLocal,
          accountNumber: contaAtual.numeroConta || contaLocal.accountNumber,
          holderDocument: currentUser.cpf || contaLocal.holderDocument,
          holderName: this.resolveHolderName(),
          availableBalance:
            contaAtual.saldoDisponivel ?? contaLocal.availableBalance,
          limit: contaAtual.limite ?? contaLocal.limit,
          manager: contaAtual.manager || contaLocal.manager,
        };

        this.persistAccountState(contaSincronizada);
        this.accountStateSubject.next(contaSincronizada);
      });
  }

  private buscarContaAtualNoMock(): Observable<ContaAtualMock> {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf) {
      return throwError(() => new Error('Usuário não identificado.'));
    }

    return this.http.get<ContaAtualMock>(
      `${this.mockApiUrl}/contas/cpf/${currentUser.cpf}`,
    );
  }

  private buildStorageKey(): string {
    return buildScopedStorageKey(
      PREFIXO_ARMAZENAMENTO_CONTA_CLIENTE,
      this.authService.currentUserValue,
    );
  }

  private resolveHolderName(): string {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.tipo === 'cliente' && currentUser.nome.trim()) {
      return currentUser.nome.trim();
    }

    return 'Cliente BanTads';
  }

  private validateAmount(amount: number): number {
    if (!Number.isFinite(amount)) {
      throw new Error('Informe um valor de deposito valido.');
    }

    const normalizedAmount = this.roundCurrency(amount);

    if (normalizedAmount <= 0) {
      throw new Error('O valor do deposito deve ser maior que zero.');
    }

    return normalizedAmount;
  }

  private buscarSaldoOrigemAposTransferencia(
    resposta: RespostaTransferenciaMock,
  ): Observable<number> {
    const cpf = this.authService.currentUserValue?.cpf;
    const saldoDaResposta = resposta.saldo ?? resposta.novoSaldoOrigem;

    if (!cpf) {
      return of(this.toCurrencyNumber(saldoDaResposta));
    }

    return this.buscarContaOrigemTransferenciaPorCpf(cpf).pipe(
      map((contaOrigem) => contaOrigem.saldoDisponivel),
      catchError(() => of(this.toCurrencyNumber(saldoDaResposta))),
    );
  }

  private temValorMonetario(
    value: number | string | null | undefined,
  ): value is number | string {
    return value !== null && value !== undefined;
  }

  private toCurrencyNumber(value: number | string | null | undefined): number {
    const numericValue = Number(value ?? 0);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private isBankAccount(value: unknown): value is BankAccount {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const account = value as Partial<BankAccount>;

    return (
      typeof account.accountId === 'string' &&
      typeof account.branch === 'string' &&
      typeof account.accountNumber === 'string' &&
      typeof account.holderName === 'string' &&
      typeof account.holderDocument === 'string' &&
      typeof account.availableBalance === 'number' &&
      Array.isArray(account.transactions) &&
      account.transactions.every((transaction) =>
        this.isAccountTransaction(transaction),
      )
    );
  }

  private isAccountTransaction(value: unknown): value is AccountTransaction {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const transaction = value as Partial<AccountTransaction>;

    return (
      typeof transaction.id === 'string' &&
      (transaction.type === 'deposito' || transaction.type === 'saque' || transaction.type === 'transferencia') &&
      typeof transaction.amount === 'number' &&
      typeof transaction.description === 'string' &&
      typeof transaction.performedAt === 'string' &&
      typeof transaction.balanceAfter === 'number'
    );
  }
}
