export type TipoMovimentacao = 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA' | string;

export interface OperacaoResponse {
  conta: string;
  data: string;
  saldo: number;
}

export interface TransferenciaRequest {
  destino: string;
  valor: number;
}

export interface TransferenciaResponse {
  conta: string;
  data: string;
  destino: string;
  saldo: number;
  valor: number;
}

export interface SaldoResponse {
  cliente: string;
  conta: string;
  saldo: number;
}

export interface ItemExtratoResponse {
  data: string;
  tipo: TipoMovimentacao;
  origem: string | null;
  destino: string | null;
  valor: number;
}

export interface ExtratoResponse {
  conta: string;
  saldo: number;
  movimentacoes: ItemExtratoResponse[];
}

export interface ContaPorCpfResponse {
  numeroConta: string;
  saldoDisponivel: number;
}

export interface ContaPerfilResponse {
  cliente: string;
  numero: string;
  saldo: number;
  limite: number;
  gerente: string;
  criacao: string;
}

export interface ContaOrigemTransferencia {
  numeroConta: string;
  saldo: number;
  limite: number;
  saldoDisponivel: number;
}

export interface ContaTransferenciaPerfil {
  cliente: string;
  nome: string;
  numero: string;
  saldo: number;
  limite: number;
  saldoDisponivel: number;
}

export interface TransacaoExtrato {
  id: string;
  dataHora: string;
  tipo: TipoMovimentacao;
  contaOrigem: string | null;
  contaDestino: string | null;
  valor: number;
}

export interface ExtratoAtual {
  numeroConta: string;
  saldoAtual: number;
  transacoes: TransacaoExtrato[];
}
