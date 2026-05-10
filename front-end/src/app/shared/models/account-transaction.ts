export type AccountTransactionType = 'deposito' | 'saque' | 'transferencia';

export interface AccountTransaction {
  id: string;
  type: AccountTransactionType;
  amount: number;
  description: string;
  performedAt: string;
  balanceAfter: number;
}
