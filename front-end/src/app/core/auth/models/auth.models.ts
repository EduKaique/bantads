export interface LoginResponse {
  access_token: string;
  token_type: string;
  tipo: string;
  usuario: {
    nome: string;
    email: string;
    cpf: string;
  };
}

export interface LogoutResponse {
  cpf: string;
  nome: string;
  email: string;
  tipo: string;
}

export interface RegisterRequest {
  cpf: string;
  nome: string;
  email: string;
  salario: number;
  celular: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string; 
  bairro: string;
  cidade: string;
  uf: string;
}

export type UserState = {
  nome: string;
  email: string;
  cpf: string;
  tipo: 'CLIENTE' | 'GERENTE' | 'ADMINISTRADOR';
  access_token: string;
} | null;