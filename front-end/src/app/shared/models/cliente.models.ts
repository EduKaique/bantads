import { Address } from './address';

export const FILTRO_CLIENTES = {
  paraAprovar: 'para_aprovar',
  relatorioAdministrativo: 'adm_relatorio_clientes',
  melhoresClientes: 'melhores_clientes',
} as const;

export type FiltroClientes =
  (typeof FILTRO_CLIENTES)[keyof typeof FILTRO_CLIENTES];

export interface AutocadastroInfo {
  cpf: string;
  nome: string;
  email: string;
  salario: number;
  telefone?: string;
  celular?: string;
  cpfGerenteResponsavel?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado?: string;
  uf?: string;
}

export interface PerfilInfo {
  nome: string;
  email: string;
  salario: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado?: string;
  uf?: string;
}

export interface DadosClienteResponse {
  id?: number | string;
  cpf: string;
  nome: string;
  email: string;
  telefone?: string;
  celular?: string;
  salario?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  uf?: string;
  cpfGerenteResponsavel?: string;
  endereco?: Partial<Address>;
}

export interface ClienteParaAprovarResponse
  extends Omit<DadosClienteResponse, 'salario'> {
  salario: number | string;
  cpfGerenteResponsavel?: string;
  dataSolicitacao: string;
  status?: string;
}

export type ParaAprovarResponse = ClienteParaAprovarResponse[];
export type RelatorioClientesResponse = DadosClienteResponse[];
export type TodosClientesResponse = ClienteResponse[];

export interface ClienteResponse extends DadosClienteResponse {
  saldo?: number;
  limite?: number;
  numeroConta?: string;
  cpfGerente?: string;
  nomeGerente?: string;
}

export interface ContaResponse {
  accountId?: string;
  branch?: string;
  accountNumber?: string;
  holderName?: string;
  holderDocument?: string;
  availableBalance?: number;
  limit?: number;
  manager?: string;
  numeroConta?: string;
}

export interface ContaClienteResponse {
  numeroConta: string;
  saldoDisponivel: number;
  limite?: number;
  nome?: string;
}

export type StatusAprovacaoCliente =
  | 'PENDENTE'
  | 'PROCESSANDO'
  | 'CONCLUIDA'
  | 'FALHOU'
  | 'COMPENSANDO'
  | string;

export interface RespostaAprovacaoClienteResponse {
  idSaga: string;
  cpfCliente: string;
  status: StatusAprovacaoCliente;
  mensagem: string;
  numeroConta?: string;
  iniciadaEm?: string;
  atualizadaEm?: string;
}

export type AprovacaoClienteResponse =
  | ContaResponse
  | RespostaAprovacaoClienteResponse;

export interface MotivoRejeicao {
  motivo: string;
}

export class CpfDuplicadoError extends Error {
  constructor() {
    super('CPF ja cadastrado.');
    this.name = 'CpfDuplicadoError';
  }
}

export function isCpfDuplicadoError(error: unknown): error is CpfDuplicadoError {
  return error instanceof CpfDuplicadoError;
}
