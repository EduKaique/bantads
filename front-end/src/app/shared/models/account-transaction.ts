export type AccountTransactionType = 'deposit';

export interface AccountTransaction {
  id: string;
  type: AccountTransactionType;
  amount: number;
  description: string;
  performedAt: string;
  balanceAfter: number;
}
