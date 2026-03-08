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
  { data: '07/03/2026', operacao: 'Saldo do dia: R$1000,00', valor: '', isSaldoRow: true },
  {
    data: '07/03/2026',
    operacao: 'Transferência',
    remetenteDestinatario: 'Rafael Pomponio',
    categoria: 'Pix',
    valor: 'R$30,00',
    operacaoColor: 'blue',
  },
  {
    data: '07/03/2026',
    operacao: 'Saque',
    remetenteDestinatario: '-',
    categoria: '-',
    valor: 'R$100,00',
    operacaoColor: 'red',
  },
  {
    data: '07/03/2026',
    operacao: 'Depósito',
    remetenteDestinatario: '-',
    categoria: '-',
    valor: 'R$200,00',
    operacaoColor: 'blue',
  },
  { data: '06/03/2026', operacao: 'Saldo do dia: R$870,00', valor: '', isSaldoRow: true },
  {
    data: '06/03/2026',
    operacao: 'Transferência',
    remetenteDestinatario: 'Natividade',
    categoria: 'Restaurante',
    valor: 'R$25,00',
    operacaoColor: 'red',
  },
  {
    data: '06/03/2026',
    operacao: 'Transferência',
    remetenteDestinatario: 'Restaurante Universitário',
    categoria: 'Restaurante',
    valor: 'R$1,30',
    operacaoColor: 'red',
  },
  {
    data: '06/03/2026',
    operacao: 'Transferência',
    remetenteDestinatario: 'Condor',
    categoria: 'Mercado',
    valor: 'R$150,00',
    operacaoColor: 'red',
  },
];
