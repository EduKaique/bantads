export interface ExtratoTransaction {
  data: string;
  hora?: string;
  operacao: string;
  remetenteDestinatario?: string;
  categoria?: string;
  valor: string;
  operacaoColor?: 'red' | 'blue' | 'purple';
}
