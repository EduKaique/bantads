import { Gerente } from './gerente';

export interface GerenteDashboard extends Gerente {
  totalClientes: number;
  totalSaldoPositivo: number;
  totalSaldoNegativo: number;
}
