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
  PREFIXO_ARMAZENAMENTO_CONTA_CLIENTE,
  buildScopedStorageKey,
} from '../../../shared/utils/session-storage.utils';

import type {
  ContaPorCpfResponse,
  ContaPerfilResponse,
  ExtratoResponse,
  OperacaoResponse,
  TransferenciaBackendResponse,
  TransacaoExtrato,
} from '../models/conta.model';

export type {
  ContaOrigemTransferencia,
  ContaTransferenciaPerfil,
  TransferenciaRequest,
  TransferenciaResponse,
  TransacaoExtrato as TransacaoExtratoMock,
  ExtratoAtual as ExtratoAtualMock,
} from '../models/conta.model';

import type {
  ContaOrigemTransferencia,
  ContaTransferenciaPerfil,
  TransferenciaRequest,
  TransferenciaResponse,
  ExtratoAtual,
} from '../models/conta.model';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class ClientAccountService {
  /**
   * URL base do microsserviço de contas.
   * Ajuste a porta caso o Spring Boot suba em outra (padrão: 8080).
   */
  private readonly apiUrl = 'http://localhost:8080';

  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  private readonly accountStateSubject = new BehaviorSubject<BankAccount>(
    this.loadAccountState(),
  );

  readonly account$ = this.accountStateSubject.asObservable();

  constructor() {
    this.sincronizarContaComBackend();
  }

  // ── Leitura ────────────────────────────────────────────────────────────────

  getCurrentAccount(): Observable<BankAccount> {
    this.sincronizarContaComBackend();
    return this.account$;
  }

  /**
   * GET /contas/{numero}/extrato
   * Retorna o extrato do cliente logado.
   */
  getExtratoAtual(): Observable<ExtratoAtual> {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf || currentUser.tipo !== 'cliente') {
      return throwError(
        () => new Error('Apenas clientes podem consultar o extrato.'),
      );
    }

    return this.buscarContaAtualNoBackend().pipe(
      switchMap((conta) =>
        this.http
          .get<ExtratoResponse>(`${this.apiUrl}/contas/${conta.numero}/extrato`)
          .pipe(
            map((resposta) => ({
              numeroConta: resposta.numero,
              nomeTitular: this.resolveHolderName(),
              saldoAtual: this.calcularSaldoDisponivel(resposta.saldo, conta.limite),
              transacoes: resposta.movimentacoes.map((item, idx) =>
                this.mapearItemExtrato(item, idx),
              ),
            })),
          ),
      ),
    );
  }

  // ── Escrita ────────────────────────────────────────────────────────────────

  /**
   * POST /contas/{numero}/depositar
   * Body: { valor: number }
   */
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

      return this.buscarContaAtualNoBackend().pipe(
        switchMap((conta) =>
          this.http
            .post<OperacaoResponse>(
              `${this.apiUrl}/contas/${conta.numero}/depositar`,
              { valor: amount },
            )
            .pipe(
              map((resposta) => {
                const balanceAfter = resposta.saldo;
                const limite = conta.limite ?? 0;

                const transaction: AccountTransaction = {
                  id: `dep-${Date.now()}`,
                  type: 'deposito',
                  amount,
                  description,
                  performedAt: resposta.data,
                  balanceAfter,
                };

                const contaLocal = this.accountStateSubject.value;
                const updatedAccount: BankAccount = {
                  ...contaLocal,
                  accountNumber: resposta.numero || contaLocal.accountNumber,
                  holderDocument: currentUser?.cpf || contaLocal.holderDocument,
                  holderName: this.resolveHolderName(),
                  availableBalance: this.calcularSaldoDisponivel(balanceAfter, limite),
                  limit: limite,
                  manager: conta.gerente || contaLocal.manager,
                  transactions: [transaction, ...contaLocal.transactions],
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

  /**
   * POST /contas/{numero}/sacar
   * Body: { valor: number }
   */
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
      const description = request.description?.trim() || 'Saque em conta';

      return this.buscarContaAtualNoBackend().pipe(
        switchMap((conta) =>
          this.http
            .post<OperacaoResponse>(
              `${this.apiUrl}/contas/${conta.numero}/sacar`,
              { valor: amount },
            )
            .pipe(
              map((resposta) => {
                const balanceAfter = resposta.saldo;
                const limite = conta.limite ?? 0;

                const transaction: AccountTransaction = {
                  id: `saq-${Date.now()}`,
                  type: 'saque',
                  amount,
                  description,
                  performedAt: resposta.data,
                  balanceAfter,
                };

                const contaLocal = this.accountStateSubject.value;
                const updatedAccount: BankAccount = {
                  ...contaLocal,
                  accountNumber: resposta.numero || contaLocal.accountNumber,
                  holderDocument: currentUser?.cpf || contaLocal.holderDocument,
                  holderName: this.resolveHolderName(),
                  availableBalance: this.calcularSaldoDisponivel(balanceAfter, limite),
                  limit: limite,
                  manager: conta.gerente || contaLocal.manager,
                  transactions: [transaction, ...contaLocal.transactions],
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
          : new Error('Nao foi possivel processar o saque.'),
      );
    }
  }

  /**
   * GET /contas/cpf/{cpf} → GET /contas/{numero}
   * Retorna conta e saldo disponível para uso em transferências.
   */
  buscarContaOrigemTransferenciaPorCpf(
    cpf: string,
  ): Observable<ContaOrigemTransferencia> {
    return this.http
      .get<ContaPorCpfResponse>(`${this.apiUrl}/contas/cpf/${cpf}`)
      .pipe(
        switchMap((contaResumida) =>
          this.http
            .get<ContaPerfilResponse>(`${this.apiUrl}/contas/${contaResumida.numero}`)
            .pipe(
              map((perfil) => ({
                numeroConta: perfil.numero,
                saldoDisponivel: this.calcularSaldoDisponivel(perfil.saldo, perfil.limite),
              })),
            ),
        ),
      );
  }

  /**
   * GET /contas/{numero}
   * Retorna perfil completo da conta para uso em transferências.
   */
  buscarContaTransferenciaPorNumero(
    numeroConta: string,
  ): Observable<ContaTransferenciaPerfil> {
    return this.http
      .get<ContaPerfilResponse>(`${this.apiUrl}/contas/${numeroConta}`)
      .pipe(
        map((perfil) => ({
          cliente: perfil.cliente,
          nome: 'Conta identificada',
          numero: perfil.numero,
          saldo: perfil.saldo,
          limite: perfil.limite,
          saldoDisponivel: this.calcularSaldoDisponivel(perfil.saldo, perfil.limite),
        })),
      );
  }

  /**
   * POST /contas/{numeroOrigem}/transferir
   * Body: { destino, valor }  (TransferenciaRequest.java)
   */
  transferirEntreContas(
    numeroContaOrigem: string,
    request: TransferenciaRequest,
  ): Observable<TransferenciaResponse> {
    return this.http
      .post<TransferenciaBackendResponse>(
        `${this.apiUrl}/contas/${numeroContaOrigem}/transferir`,
        {
          destino: request.destino,
          valor: request.valor,
        },
      )
      .pipe(
        map((resposta) => ({
          conta: resposta.conta,
          data: resposta.data,
          destino: resposta.destino,
          saldo: resposta.saldo,
          valor: resposta.valor,
        })),
      );
  }

  calcularSaldoDisponivel(
    saldo: number | null | undefined,
    limite: number | null | undefined,
  ): number {
    return this.roundCurrency((saldo ?? 0) + (limite ?? 0));
  }

  // ── Privados ──────────────────────────────────────────────────────────────

  /**
   * GET /contas/cpf/{cpf} → GET /contas/{numero}
   * Busca o perfil completo da conta do usuário logado.
   */
  private buscarContaAtualNoBackend(): Observable<ContaPerfilResponse> {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf) {
      return throwError(() => new Error('Usuário não identificado.'));
    }

    return this.http
      .get<ContaPorCpfResponse>(`${this.apiUrl}/contas/cpf/${currentUser.cpf}`)
      .pipe(
        switchMap((contaResumida) =>
          this.http.get<ContaPerfilResponse>(
            `${this.apiUrl}/contas/${contaResumida.numero}`,
          ),
        ),
      );
  }

  private sincronizarContaComBackend(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf || currentUser.tipo !== 'cliente') {
      return;
    }

    this.buscarContaAtualNoBackend()
      .pipe(catchError(() => of(null)))
      .subscribe((conta) => {
        if (!conta) return;

        const contaLocal = this.accountStateSubject.value;
        const contaSincronizada: BankAccount = {
          ...contaLocal,
          accountNumber: conta.numero || contaLocal.accountNumber,
          holderDocument: currentUser.cpf || contaLocal.holderDocument,
          holderName: this.resolveHolderName(),
          availableBalance: this.calcularSaldoDisponivel(conta.saldo, conta.limite),
          limit: conta.limite ?? contaLocal.limit,
          manager: conta.gerente || contaLocal.manager,
        };

        this.persistAccountState(contaSincronizada);
        this.accountStateSubject.next(contaSincronizada);
      });
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

    return {
      accountId: '',
      branch: '0001',
      accountNumber: '',
      holderName: this.resolveHolderName(),
      holderDocument: this.authService.currentUserValue?.cpf ?? '',
      availableBalance: 0,
      limit: 0,
      manager: null,
      transactions: [],
    } as unknown as BankAccount;
  }

  private persistAccountState(account: BankAccount): void {
    localStorage.setItem(this.buildStorageKey(), JSON.stringify(account));
  }

  private buildStorageKey(): string {
    return buildScopedStorageKey(
      PREFIXO_ARMAZENAMENTO_CONTA_CLIENTE,
      this.authService.currentUserValue,
    );
  }

  private resolveHolderName(): string {
    const currentUser = this.authService.currentUserValue;
    if (currentUser?.tipo === 'cliente' && currentUser.nome?.trim()) {
      return currentUser.nome.trim();
    }
    return 'Cliente BanTads';
  }

  private validateAmount(amount: number): number {
    if (!Number.isFinite(amount)) {
      throw new Error('Informe um valor valido.');
    }
    const normalizedAmount = this.roundCurrency(amount);
    if (normalizedAmount <= 0) {
      throw new Error('O valor deve ser maior que zero.');
    }
    return normalizedAmount;
  }

  private mapearItemExtrato(
    item: ExtratoResponse['movimentacoes'][number],
    idx: number,
  ): TransacaoExtrato {
    return {
      id: `extrato-${idx}-${item.data}`,
      dataHora: item.data,
      tipo: item.tipo,
      contaOrigem: item.origem,
      contaDestino: item.destino,
      valor: item.valor,
    };
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private isBankAccount(value: unknown): value is BankAccount {
    if (!value || typeof value !== 'object') return false;
    const account = value as Partial<BankAccount>;
    return (
      typeof account.accountNumber === 'string' &&
      typeof account.holderName === 'string' &&
      typeof account.holderDocument === 'string' &&
      typeof account.availableBalance === 'number' &&
      Array.isArray(account.transactions)
    );
  }
}