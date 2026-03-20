import { AccountTransaction } from '../../../shared/models/account-transaction';
import { BankAccount } from '../../../shared/models/bank-account';

type DepositTransactionFactoryInput = {
  amount: number;
  balanceAfter: number;
  description: string;
  performedAt?: string;
};

export function createMockClientAccount(holderName: string): BankAccount {
  const openingBalance = 2450.75;
  const initialTransaction = createDepositTransaction({
    amount: openingBalance,
    balanceAfter: openingBalance,
    description: 'Saldo inicial da conta',
    performedAt: '2026-03-01T10:00:00.000Z',
  });

  return {
    accountId: 'client-main-account',
    branch: '0001',
    accountNumber: '123456-7',
    holderName,
    holderDocument: '123.456.789-10',
    availableBalance: openingBalance,
    manager: 'João da Silva',
    transactions: [initialTransaction],
  };
}

export function createDepositTransaction(
  input: DepositTransactionFactoryInput
): AccountTransaction {
  return {
    id: `deposit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'deposit',
    amount: input.amount,
    description: input.description,
    performedAt: input.performedAt ?? new Date().toISOString(),
    balanceAfter: input.balanceAfter,
  };
}
