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