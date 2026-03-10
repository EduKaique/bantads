import { AccountTransaction } from './account-transaction';

export interface BankAccount {
  accountId: string;
  branch: string;
  accountNumber: string;
  holderName: string;
  holderDocument: string;
  availableBalance: number;
  transactions: AccountTransaction[];
}
