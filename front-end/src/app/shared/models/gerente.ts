export interface DadoGerente {
  cpf: string;
  nome: string;
  email: string;
  tipo?: string;
  telefone?: string;
}

export interface Gerente extends DadoGerente { }

export interface DadoGerenteInsercao {
  cpf: string;
  nome: string;
  email: string;
  tipo?: string;
  senha?: string;
  telefone?: string;
}

export interface DadoGerenteAtualizacao {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface ItemDashboardResponse extends Gerente {
  totalClientes: number;
  totalSaldoPositivo: number;
  totalSaldoNegativo: number;
}

export type GerentesResponse = Gerente[];
export type DashboardResponse = ItemDashboardResponse[];
