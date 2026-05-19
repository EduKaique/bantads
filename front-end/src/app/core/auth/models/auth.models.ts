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

export type UserState = {
  nome: string;
  email: string;
  cpf: string;
  tipo: 'CLIENTE' | 'GERENTE' | 'ADMIN';
  access_token: string;
} | null;
