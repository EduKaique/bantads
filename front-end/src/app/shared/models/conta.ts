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
  tipo: 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA' | string;
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