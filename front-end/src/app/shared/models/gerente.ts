export interface DadoGerente {
  cpf: string;
  nome: string;
  email: string;
  tipo?: string;
  celular?: string;
}

export interface Gerente extends DadoGerente {
  celular: string;
}

export interface DadoGerenteInsercao {
  cpf: string;
  nome: string;
  email: string;
  tipo?: string;
  senha?: string;
  celular?: string;
}

export interface DadoGerenteAtualizacao {
  nome?: string;
  email?: string;
  senha?: string;
  celular?: string;
}

export interface ItemDashboardResponse extends Gerente {
  totalClientes: number;
  totalSaldoPositivo: number;
  totalSaldoNegativo: number;
}

export type GerentesResponse = Gerente[];
export type DashboardResponse = ItemDashboardResponse[];
