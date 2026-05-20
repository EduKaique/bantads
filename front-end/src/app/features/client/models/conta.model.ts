// ─── DTOs de resposta do backend ─────────────────────────────────────────────

/** GET /contas/cpf/{cpf} */
export interface ContaPorCpfResponse {
  numero: string;
  saldo: number;
}

/** GET /contas/{numero} */
export interface ContaPerfilResponse {
  cliente: string;
  numero: string;
  saldo: number;
  limite: number;
  gerente: string;
  criacao: string;
}

/** Item individual do extrato */
export interface ItemExtratoResponse {
  data: string;
  tipo: TipoMovimentacao;
  origem: string | null;
  destino: string | null;
  valor: number;
}

/** GET /contas/{numero}/extrato */
export interface ExtratoResponse {
  numero: string;
  saldo: number;
  movimentacoes: ItemExtratoResponse[];
}

/** POST /contas/{numero}/depositar  |  POST /contas/{numero}/sacar */
export interface OperacaoResponse {
  numero: string;
  data: string;
  saldo: number;
}

/** POST /contas/{numero}/transferir */
export interface TransferenciaBackendResponse {
  conta: string;
  data: string;
  destino: string;
  saldo: number;
  valor: number;
}

// ─── Tipos compartilhados ─────────────────────────────────────────────────────

export type TipoMovimentacao = 'DEPOSITO' | 'SAQUE' | 'TRANSFERENCIA';

// ─── Interfaces públicas do service ──────────────────────────────────────────

export interface ContaOrigemTransferencia {
  numeroConta: string;
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

export interface TransacaoExtrato {
  id: string;
  dataHora: string;
  tipo: TipoMovimentacao;
  contaOrigem: string | null;
  nomeOrigem?: string | null;
  contaDestino: string | null;
  nomeDestino?: string | null;
  valor: number;
}

export interface ExtratoAtual {
  numeroConta: string;
  nomeTitular: string;
  saldoAtual: number;
  transacoes: TransacaoExtrato[];
}