export interface Transaction {
  data: string;
  hora?: string;
  operacao: string;
  remetenteDestinatario?: string;
  categoria?: string;
  valor: string;
  operacaoColor?: 'red' | 'blue' | 'purple';
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  criarTransacaoMock('05/03/2026', '10:30', 'Transferência', 'Deposito inicial', 'Operação bancária', 'R$2.450,75', 'blue'),
  criarTransacaoMock('15/03/2026', '14:15', 'Depósito', 'Você', 'Operação bancária', 'R$1.500,00', 'blue'),
  criarTransacaoMock('15/03/2026', '16:45', 'Transferência', 'Pagamento Boleto', 'Boleto', 'R$250,00', 'red'),
  criarTransacaoMock('14/03/2026', '09:20', 'Transferência', 'João Silva', 'Pix', 'R$85,50', 'red'),
  criarTransacaoMock('14/03/2026', '11:50', 'Saque', 'Você', 'Operação bancária', 'R$200,00', 'red'),
  criarTransacaoMock('07/03/2026', '08:30', 'Transferência', 'Rafael Pomponio', 'Pix', 'R$30,00', 'blue'),
  criarTransacaoMock('07/03/2026', '13:10', 'Saque', 'Você', 'Operação bancária', 'R$100,00', 'red'),
  criarTransacaoMock('07/03/2026', '15:40', 'Depósito', 'Você', 'Operação bancária', 'R$200,00', 'blue'),
  criarTransacaoMock('06/03/2026', '10:15', 'Transferência', 'Natividade', 'Restaurante', 'R$25,00', 'red'),
  criarTransacaoMock('06/03/2026', '12:30', 'Transferência', 'Restaurante Universitário', 'Restaurante', 'R$1,30', 'red'),
  criarTransacaoMock('06/03/2026', '17:50', 'Transferência', 'Condor', 'Mercado', 'R$150,00', 'red'),
  criarTransacaoMock('28/02/2026', '09:45', 'Transferência', 'Electrolux', 'Compras Online', 'R$450,70', 'red'),
  criarTransacaoMock('28/02/2026', '18:20', 'Depósito', 'Você', 'Operação bancária', 'R$500,00', 'blue'),
  criarTransacaoMock('25/02/2026', '08:00', 'Saque', 'Você', 'Operação bancária', 'R$300,00', 'red'),
  criarTransacaoMock('25/02/2026', '19:30', 'Transferência', 'Academia XYZ', 'Saúde', 'R$120,00', 'red'),
  criarTransacaoMock('20/02/2026', '10:00', 'Transferência', 'Universidade Federal do Paraná', 'Educação', 'R$2.000,00', 'red'),
  criarTransacaoMock('20/02/2026', '15:55', 'Depósito', 'Você', 'Operação bancária', 'R$3.000,00', 'blue'),
  criarTransacaoMock('15/02/2026', '14:25', 'Transferência', 'Netflix', 'Assinatura', 'R$29,90', 'red'),
  criarTransacaoMock('15/02/2026', '16:40', 'Transferência', 'Carlos Santos', 'Pix', 'R$50,00', 'red'),
  criarTransacaoMock('10/02/2026', '09:15', 'Depósito', 'Você', 'Operação bancária', 'R$800,00', 'blue'),
  criarTransacaoMock('10/02/2026', '17:35', 'Saque', 'Você', 'Operação bancária', 'R$450,00', 'red'),
  criarTransacaoMock('05/02/2026', '11:05', 'Transferência', 'Globalsys Serviços', 'Internet', 'R$89,90', 'red'),
  criarTransacaoMock('05/02/2026', undefined, 'Transferência', 'Mercado Central', 'Mercado', 'R$125,75', 'red'),
];

function criarTransacaoMock(
  data: string,
  hora: string | undefined,
  operacao: Transaction['operacao'],
  remetenteDestinatario: string,
  categoria: string,
  valor: string,
  operacaoColor: NonNullable<Transaction['operacaoColor']>,
): Transaction {
  return {
    data,
    hora,
    operacao,
    remetenteDestinatario,
    categoria,
    valor,
    operacaoColor,
  };
}
