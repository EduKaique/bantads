import { ContaPerfilResponse } from './conta';

export interface ContaConsulta extends Partial<ContaPerfilResponse> {
  cpf?: string;
  numeroConta?: string;
  saldoDisponivel?: number;
  holderDocument?: string;
  accountNumber?: string;
  availableBalance?: number;
  limit?: number;
  managerDocument?: string;
  manager?: string;
  holderName?: string;
}

export interface RelatorioCliente {
  cpfCliente: string;
  nomeCliente: string;
  emailCliente: string;
  salario: number;
  numeroConta: string;
  saldo: number;
  limite: number;
  cpfGerente: string;
  nomeGerente: string;
}

export interface ClienteCarteira {
  id: string;
  cpf: string;
  nome: string;
  cidade: string;
  estado: string;
  saldo: number;
  limite: number;
  numeroConta?: string;
}

export interface EnderecoClienteDetalhado {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface ClienteDetalhado {
  nome: string;
  cpf: string;
  email: string;
  celular: string;
  endereco: EnderecoClienteDetalhado;
  salario: number;
  saldo: number;
  limite: number;
  gerente?: string;
  managerDocument?: string;
}

export interface InformacoesMelhorCliente {
  nome: string;
  cpf: string;
  cidade: string;
  estado: string;
  saldo: number;
}
