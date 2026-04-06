import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { AccountTransaction } from '../../../shared/models/account-transaction';
import { BankAccount } from '../../../shared/models/bank-account';
import { DepositRequest } from '../../../shared/models/deposit-request';
import {
  createDepositTransaction,
  createMockClientAccount,
} from './client-account.factory';

@Injectable({
  providedIn: 'root',
})
export class ClientAccountService {
  private readonly authService = inject(AuthService);
  private readonly accountStateSubject = new BehaviorSubject<BankAccount>(
    this.loadAccountState()
  );

  readonly account$ = this.accountStateSubject.asObservable();


  getCurrentAccount(): Observable<BankAccount> {
    return this.account$;
  }

  depositIntoCurrentAccount(request: DepositRequest): Observable<BankAccount> {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.tipo !== 'cliente') {
      return throwError(
        () => new Error('Apenas clientes podem realizar depositos.')
      );
    }

    try {
      const amount = this.validateAmount(request.amount);
      const currentAccount = this.accountStateSubject.value;
      const balanceAfter = this.roundCurrency(
        currentAccount.availableBalance + amount
      );

      const transaction = createDepositTransaction({
        amount,
        balanceAfter,
        description: request.description?.trim() || 'Deposito em conta',
      });

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
          : new Error('Nao foi possivel processar o deposito.')
      );
    }
  }

  withdrawFromCurrentAccount(request: { amount: number; description?: string }): Observable<BankAccount> {
    const currentUser = this.authService.currentUserValue;

    if (currentUser && currentUser.tipo !== 'cliente') {
      return throwError(
        () => new Error('Apenas clientes podem realizar saques.')
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
        currentAccount.availableBalance - amount
      );

      const transaction: AccountTransaction = {
        id: Math.random().toString(36).substring(2, 10),
        type: 'withdrawal',
        amount: amount,
        description: request.description?.trim() || 'Saque em conta',
        performedAt: new Date().toISOString(),
        balanceAfter: balanceAfter
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
          : new Error('Nao foi possivel processar o saque.')
      );
    }
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

  private buildStorageKey(): string {
    const currentUser = this.authService.currentUserValue;
    const sessionKey =
      currentUser?.tipo === 'cliente'
        ? this.normalizeStorageKeySegment(
            currentUser.email || currentUser.nome || 'cliente'
          )
        : 'local-demo';

    return `client-account-state:${sessionKey}`;
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

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private normalizeStorageKeySegment(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
        this.isAccountTransaction(transaction)
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
      (transaction.type === 'deposit' || transaction.type === 'withdrawal') &&
      typeof transaction.amount === 'number' &&
      typeof transaction.description === 'string' &&
      typeof transaction.performedAt === 'string' &&
      typeof transaction.balanceAfter === 'number'
    );
  }
}
