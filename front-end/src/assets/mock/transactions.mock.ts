export interface Transaction {
  data: string;
  operacao: string;
  remetenteDestinatario?: string;
  categoria?: string;
  valor: string;
  isSaldoRow?: boolean;
  operacaoColor?: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { data: '09/03/2026', operacao: 'Saldo do dia: R$2000,00', valor: '', isSaldoRow: true },
  {
    data: '09/03/2026',
    operacao: 'Transferência - 10:00',
    remetenteDestinatario: 'João Silva',
    categoria: 'Pix',
    valor: 'R$50,00',
    operacaoColor: 'blue',
  },
  { data: '08/03/2026', operacao: 'Saldo do dia: R$1500,00', valor: '', isSaldoRow: true },
  {
    data: '08/03/2026',
    operacao: 'Saque - 14:30',
    remetenteDestinatario: 'Banco',
    categoria: 'Banco',
    valor: 'R$200,00',
    operacaoColor: 'red',
  },
  {
    data: '08/03/2026',
    operacao: 'Transferência - 09:15',
    remetenteDestinatario: 'Maria Santos',
    categoria: 'Pagamento',
    valor: 'R$100,00',
    operacaoColor: 'red',
  },
  { data: '07/03/2026', operacao: 'Saldo do dia: R$1000,00', valor: '', isSaldoRow: true },
  {
    data: '07/03/2026',
    operacao: 'Transferência - 14:23',
    remetenteDestinatario: 'Rafael Pomponio',
    categoria: 'Pix',
    valor: 'R$30,00',
    operacaoColor: 'blue',
  },
  {
    data: '07/03/2026',
    operacao: 'Saque - 15:56',
    remetenteDestinatario: 'Banco',
    categoria: 'Banco',
    valor: 'R$100,00',
    operacaoColor: 'red',
  },
  {
    data: '07/03/2026',
    operacao: 'Depósito - 09:30',
    remetenteDestinatario: 'Banco',
    categoria: 'Banco',
    valor: 'R$200,00',
    operacaoColor: 'blue',
  },
  { data: '06/03/2026', operacao: 'Saldo do dia: R$870,00', valor: '', isSaldoRow: true },
  {
    data: '06/03/2026',
    operacao: 'Transferência - 13:45',
    remetenteDestinatario: 'Natividade',
    categoria: 'Restaurante',
    valor: 'R$25,00',
    operacaoColor: 'red',
  },
  {
    data: '06/03/2026',
    operacao: 'Transferência - 12:15',
    remetenteDestinatario: 'RU',
    categoria: 'Restaurante',
    valor: 'R$1,30',
    operacaoColor: 'red',
  },
  {
    data: '06/03/2026',
    operacao: 'Transferência - 11:20',
    remetenteDestinatario: 'Condor',
    categoria: 'Mercado',
    valor: 'R$150,00',
    operacaoColor: 'red',
  },
  { data: '05/03/2026', operacao: 'Saldo do dia: R$950,00', valor: '', isSaldoRow: true },
  {
    data: '05/03/2026',
    operacao: 'Depósito - 08:45',
    remetenteDestinatario: 'Banco',
    categoria: 'Banco',
    valor: 'R$300,00',
    operacaoColor: 'blue',
  },
  {
    data: '05/03/2026',
    operacao: 'Transferência - 16:20',
    remetenteDestinatario: 'Pedro Oliveira',
    categoria: 'Pix',
    valor: 'R$75,00',
    operacaoColor: 'red',
  },
];
