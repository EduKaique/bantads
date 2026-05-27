export interface ExtratoTransaction {
  data: string;
  hora?: string;
  operacao: string;
  remetenteDestinatario?: string;
  categoria?: string;
  valor: number;
  operacaoColor?: 'red' | 'blue' | 'purple';
}
