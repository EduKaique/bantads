import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import { AuthService } from '../auth/services/auth.service';
import { API_URL } from '../configs/api.token';
import { AccountTransaction } from '../../shared/models/account-transaction';
import { BankAccount } from '../../shared/models/bank-account';
import { DepositRequest } from '../../shared/models/deposit-request';
import {
  ContaOrigemTransferencia,
  ContaPerfilResponse,
  ContaPorCpfResponse,
  ContaTransferenciaPerfil,
  ExtratoAtual,
  ExtratoResponse,
  OperacaoResponse,
  SaldoResponse,
  TransacaoExtrato,
  TransferenciaRequest,
  TransferenciaResponse,
} from '../../shared/models/conta';
import { ContaConsulta } from '../../shared/models/consultas-gerenciais';
import {
  PREFIXO_ARMAZENAMENTO_CONTA_CLIENTE,
  buildScopedStorageKey,
} from '../../shared/utils/session-storage.utils';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly authService = inject(AuthService);

  private readonly accountStateSubject = new BehaviorSubject<BankAccount>(
    this.loadAccountState(),
  );

  readonly account$ = this.accountStateSubject.asObservable();

  buscarContaPorCpf(cpf: string): Observable<ContaPorCpfResponse> {
    return this.http.get<ContaPorCpfResponse>(
      `${this.apiUrl}/contas/cpf/${this.normalizarDocumento(cpf)}`,
      this.withBearerAuth(),
    );
  }

  buscarConta(numeroConta: string): Observable<ContaPerfilResponse> {
    return this.http.get<ContaPerfilResponse>(
      `${this.apiUrl}/contas/${numeroConta}`,
      this.withBearerAuth(),
    );
  }

  buscarPerfilContaPorCpf(cpf: string): Observable<ContaConsulta | null> {
    return this.buscarContaPorCpf(cpf).pipe(
      switchMap((contaResumida) =>
        this.buscarConta(contaResumida.numeroConta).pipe(
          map((perfil) => this.mapearContaConsulta(cpf, contaResumida, perfil)),
        ),
      ),
      catchError((erro: unknown) => {
        if (erro instanceof HttpErrorResponse && erro.status === 404) {
          return of(null);
        }

        return throwError(() => erro);
      }),
    );
  }

  private mapearContaConsulta(
    cpf: string,
    contaResumida: ContaPorCpfResponse,
    perfil: ContaConsulta,
  ): ContaConsulta {
    const cpfNormalizado = this.normalizarDocumento(cpf);
    const gerenteCompatibilidade =
      perfil.manager && this.normalizarDocumento(perfil.manager).length === 11
        ? perfil.manager
        : '';

    return {
      ...contaResumida,
      ...perfil,
      cliente: perfil.cliente || perfil.holderDocument || perfil.cpf || cpfNormalizado,
      numero: perfil.numero || perfil.accountNumber || perfil.numeroConta || contaResumida.numeroConta,
      saldo: perfil.saldo ?? perfil.availableBalance ?? perfil.saldoDisponivel ?? contaResumida.saldoDisponivel,
      limite: perfil.limite ?? perfil.limit ?? contaResumida.limite,
      gerente:
        perfil.gerente ||
        perfil.managerDocument ||
        contaResumida.gerente ||
        contaResumida.managerDocument ||
        gerenteCompatibilidade,
      holderDocument: perfil.holderDocument || perfil.cpf || cpfNormalizado,
      accountNumber: perfil.accountNumber || perfil.numeroConta || contaResumida.numeroConta,
      availableBalance:
        perfil.availableBalance ?? perfil.saldoDisponivel ?? contaResumida.saldoDisponivel,
      limit: perfil.limit ?? perfil.limite ?? contaResumida.limite,
      managerDocument: perfil.managerDocument || contaResumida.managerDocument,
      manager: perfil.manager || contaResumida.manager,
    };
  }

  depositar(numeroConta: string, valor: number): Observable<OperacaoResponse> {
    return this.http.post<OperacaoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/depositar`,
      { valor },
      this.withBearerAuth(),
    );
  }

  sacar(numeroConta: string, valor: number): Observable<OperacaoResponse> {
    return this.http.post<OperacaoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/sacar`,
      { valor },
      this.withBearerAuth(),
    );
  }

  transferir(
    numeroConta: string,
    request: TransferenciaRequest,
  ): Observable<TransferenciaResponse> {
    return this.http.post<TransferenciaResponse>(
      `${this.apiUrl}/contas/${numeroConta}/transferir`,
      request,
      this.withBearerAuth(),
    );
  }

  consultarSaldo(numeroConta: string): Observable<SaldoResponse> {
    return this.http.get<SaldoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/saldo`,
      this.withBearerAuth(),
    );
  }

  consultarExtrato(numeroConta: string): Observable<ExtratoResponse> {
    return this.http.get<ExtratoResponse>(
      `${this.apiUrl}/contas/${numeroConta}/extrato`,
      this.withBearerAuth(),
    );
  }

  getCurrentAccount(): Observable<BankAccount> {
    this.sincronizarContaAtual();
    return this.account$;
  }

  getExtratoAtual(): Observable<ExtratoAtual> {
    return this.buscarContaAtualDoUsuario().pipe(
      switchMap((conta) =>
        this.consultarExtrato(conta.numero).pipe(
          map((resposta) => ({
            numeroConta: resposta.conta,
            saldoAtual: resposta.saldo,
            transacoes: resposta.movimentacoes.map((item, idx) =>
              this.mapearItemExtrato(item, idx),
            ),
          })),
        ),
      ),
    );
  }

  depositIntoCurrentAccount(request: DepositRequest): Observable<BankAccount> {
    try {
      const amount = this.validateAmount(request.amount);
      const description = request.description?.trim() || 'Deposito em conta';

      return this.buscarContaAtualDoUsuario().pipe(
        switchMap((conta) =>
          this.depositar(conta.numero, amount).pipe(
            map((resposta) =>
              this.atualizarContaLocalAposOperacao(
                conta,
                resposta,
                'deposito',
                amount,
                description,
              ),
            ),
          ),
        ),
      );
    } catch (error) {
      return throwError(() => this.normalizarErro(error, 'Nao foi possivel processar o deposito.'));
    }
  }

  withdrawFromCurrentAccount(request: {
    amount: number;
    description?: string;
  }): Observable<BankAccount> {
    try {
      const amount = this.validateAmount(request.amount);
      const description = request.description?.trim() || 'Saque em conta';

      return this.buscarContaAtualDoUsuario().pipe(
        switchMap((conta) =>
          this.sacar(conta.numero, amount).pipe(
            map((resposta) =>
              this.atualizarContaLocalAposOperacao(
                conta,
                resposta,
                'saque',
                amount,
                description,
              ),
            ),
          ),
        ),
      );
    } catch (error) {
      return throwError(() => this.normalizarErro(error, 'Nao foi possivel processar o saque.'));
    }
  }

  buscarContaOrigemTransferenciaPorCpf(
    cpf: string,
  ): Observable<ContaOrigemTransferencia> {
    return this.buscarContaPorCpf(cpf).pipe(
      switchMap((contaResumida) => this.buscarConta(contaResumida.numeroConta)),
      map((perfil) => ({
        numeroConta: perfil.numero,
        saldo: perfil.saldo,
        limite: perfil.limite,
        saldoDisponivel: this.calcularSaldoDisponivel(perfil.saldo, perfil.limite),
      })),
    );
  }

  buscarContaTransferenciaPorNumero(
    numeroConta: string,
  ): Observable<ContaTransferenciaPerfil> {
    return this.buscarConta(numeroConta).pipe(
      switchMap((perfil) =>
        this.buscarNomeCliente(perfil.cliente).pipe(
          map((nome) => ({
            cliente: perfil.cliente,
            nome,
            numero: perfil.numero,
            saldo: perfil.saldo,
            limite: perfil.limite,
            saldoDisponivel: this.calcularSaldoDisponivel(perfil.saldo, perfil.limite),
          })),
        ),
      ),
    );
  }

  transferirEntreContas(
    numeroContaOrigem: string,
    request: TransferenciaRequest,
  ): Observable<TransferenciaResponse> {
    return this.transferir(numeroContaOrigem, request).pipe(
      tap((resposta) => {
        const contaAtual = this.accountStateSubject.value;
        const limite = contaAtual.limit ?? 0;
        const contaLocalAtualizada: BankAccount = {
          ...contaAtual,
          accountNumber: resposta.conta || contaAtual.accountNumber,
          availableBalance: this.calcularSaldoDisponivel(resposta.saldo, limite),
          transactions: [
            {
              id: `trf-${Date.now()}`,
              type: 'transferencia',
              amount: request.valor,
              description: `Transferencia para ${request.destino}`,
              performedAt: resposta.data,
              balanceAfter: resposta.saldo,
            },
            ...contaAtual.transactions,
          ],
        };

        this.persistAccountState(contaLocalAtualizada);
        this.accountStateSubject.next(contaLocalAtualizada);
      }),
    );
  }

  calcularSaldoDisponivel(
    saldo: number | null | undefined,
    limite: number | null | undefined,
  ): number {
    return this.roundCurrency((saldo ?? 0) + (limite ?? 0));
  }

  private buscarContaAtualDoUsuario(): Observable<ContaPerfilResponse> {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf) {
      return throwError(() => new Error('Usuario nao identificado.'));
    }

    if (currentUser.tipo !== 'CLIENTE') {
      return throwError(() => new Error('Apenas clientes podem acessar a conta.'));
    }

    return this.buscarContaPorCpf(currentUser.cpf).pipe(
      switchMap((contaResumida) => this.buscarConta(contaResumida.numeroConta)),
    );
  }

  private sincronizarContaAtual(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser?.cpf || currentUser.tipo !== 'CLIENTE') {
      return;
    }

    this.buscarContaAtualDoUsuario()
      .pipe(catchError(() => of(null)))
      .subscribe((conta) => {
        if (!conta) return;

        const contaLocal = this.accountStateSubject.value;
        const contaSincronizada: BankAccount = {
          ...contaLocal,
          accountId: conta.numero || contaLocal.accountId,
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

  private atualizarContaLocalAposOperacao(
    contaPerfil: ContaPerfilResponse,
    resposta: OperacaoResponse,
    tipo: AccountTransaction['type'],
    amount: number,
    description: string,
  ): BankAccount {
    const contaLocal = this.accountStateSubject.value;
    const limite = contaPerfil.limite ?? contaLocal.limit ?? 0;
    const transaction: AccountTransaction = {
      id: `${tipo}-${Date.now()}`,
      type: tipo,
      amount,
      description,
      performedAt: resposta.data,
      balanceAfter: resposta.saldo,
    };

    const updatedAccount: BankAccount = {
      ...contaLocal,
      accountId: resposta.conta || contaPerfil.numero || contaLocal.accountId,
      accountNumber: resposta.conta || contaPerfil.numero || contaLocal.accountNumber,
      holderDocument:
        this.authService.currentUserValue?.cpf || contaPerfil.cliente || contaLocal.holderDocument,
      holderName: this.resolveHolderName(),
      availableBalance: this.calcularSaldoDisponivel(resposta.saldo, limite),
      limit: limite,
      manager: contaPerfil.gerente || contaLocal.manager,
      transactions: [transaction, ...contaLocal.transactions],
    };

    this.persistAccountState(updatedAccount);
    this.accountStateSubject.next(updatedAccount);

    return updatedAccount;
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

  private loadAccountState(): BankAccount {
    const storageKey = this.buildStorageKey();
    const persistedState = localStorage.getItem(storageKey);

    if (persistedState) {
      try {
        const parsedState: unknown = JSON.parse(persistedState);
        if (this.isBankAccount(parsedState) && this.isAccountFromCurrentUser(parsedState)) {
          return parsedState;
        }

        localStorage.removeItem(storageKey);
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
      manager: '',
      transactions: [],
    };
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
    if (currentUser?.tipo === 'CLIENTE' && currentUser.nome?.trim()) {
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

  private normalizarErro(error: unknown, fallback: string): Error {
    return error instanceof Error ? error : new Error(fallback);
  }

  private buscarNomeCliente(cpf: string): Observable<string> {
    return this.http
      .get<{ nome?: string }>(
        `${this.apiUrl}/clientes/${this.normalizarDocumento(cpf)}`,
        this.withBearerAuth(),
      )
      .pipe(
        map((cliente) => cliente.nome?.trim() || 'Conta identificada'),
        catchError(() => of('Conta identificada')),
      );
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

  private isAccountFromCurrentUser(account: BankAccount): boolean {
    const cpfUsuarioAtual = this.authService.currentUserValue?.cpf;

    if (!cpfUsuarioAtual) {
      return true;
    }

    return (
      this.normalizarDocumento(account.holderDocument) ===
      this.normalizarDocumento(cpfUsuarioAtual)
    );
  }

  private withBearerAuth(): { headers?: HttpHeaders } {
    const token =
      localStorage.getItem('token') ||
      this.authService.currentUserValue?.access_token;

    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  private normalizarDocumento(valor: string): string {
    return valor.replace(/\D/g, '');
  }
}
