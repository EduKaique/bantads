export type AccountTransactionType = 'deposit' | 'withdrawal';

export interface AccountTransaction {
  id: string;
  type: AccountTransactionType;
  amount: number;
  description: string;
  performedAt: string;
  balanceAfter: number;
}
