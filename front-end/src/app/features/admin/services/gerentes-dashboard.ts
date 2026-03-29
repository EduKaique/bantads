import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../../core/configs/api.token';
import { GerenteDashboard } from '../../../shared/models/gerente-dashboard';
import { DashboardEstatisticas } from '../../../shared/models/dashboard-estatisticas';
import { Gerente } from '../../../shared/models/gerente';

interface BankAccount {
  cpf: string;
  saldoPositivo: number;
  saldoNegativo: number;
}

interface Cliente {
  cpf: string;
  cpfGerente: string;
}

interface Conta {
  cpf: string;
  saldoPositivo: number;
  saldoNegativo: number;
}

@Injectable({
  providedIn: 'root',
})
export class GerentesDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  obterEstatisticas(): Observable<DashboardEstatisticas> {
    return forkJoin({
      gerentes: this.http.get<Gerente[]>(`${this.apiUrl}/gerentes`),
      contas: this.http.get<Conta[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<Cliente[]>(`${this.apiUrl}/clientes`),
    }).pipe(
      map(({ gerentes, contas, clientes }) => {
        const totalGerentes = gerentes.length;
        const totalClientes = clientes.length;

        // Calcular saldo líquido de cada gerente
        const totalGerentesPositivos = gerentes.filter((g) => {
          const clientesGerente = clientes.filter((c) => c.cpfGerente === g.cpf);
          const contasGerente = contas.filter((conta) =>
            clientesGerente.some((cliente) => cliente.cpf === conta.cpf)
          );

          const saldoPositivoTotal = contasGerente.reduce(
            (acc, conta) => acc + conta.saldoPositivo,
            0
          );
          const saldoNegativoTotal = contasGerente.reduce(
            (acc, conta) => acc + conta.saldoNegativo,
            0
          );

          // Se saldoNegativo <= saldoPositivo (resultado >= 0), gerente é positivo
          return saldoNegativoTotal <= saldoPositivoTotal;
        }).length;

        const totalGerentesNegativos = gerentes.filter((g) => {
          const clientesGerente = clientes.filter((c) => c.cpfGerente === g.cpf);
          const contasGerente = contas.filter((conta) =>
            clientesGerente.some((cliente) => cliente.cpf === conta.cpf)
          );

          const saldoPositivoTotal = contasGerente.reduce(
            (acc, conta) => acc + conta.saldoPositivo,
            0
          );
          const saldoNegativoTotal = contasGerente.reduce(
            (acc, conta) => acc + conta.saldoNegativo,
            0
          );

          // Se saldoNegativo > saldoPositivo, gerente é negativo
          return saldoNegativoTotal > saldoPositivoTotal;
        }).length;

        return {
          totalGerentes,
          totalClientes,
          totalGerentesPositivos,
          totalGerentesNegativos,
        };
      }),
    );
  }

  obterGerentesComDados(): Observable<GerenteDashboard[]> {
    return forkJoin({
      gerentes: this.http.get<Gerente[]>(`${this.apiUrl}/gerentes`),
      contas: this.http.get<Conta[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<Cliente[]>(`${this.apiUrl}/clientes`),
    }).pipe(
      map(({ gerentes, contas, clientes }) => {
        return gerentes.map((gerente) => {
          const clientesGerente = clientes.filter(
            (c) => c.cpfGerente === gerente.cpf,
          );
          const contasGerente = contas.filter((conta) =>
            clientesGerente.some((cliente) => cliente.cpf === conta.cpf),
          );

          return {
            ...gerente,
            totalClientes: clientesGerente.length,
            totalSaldoPositivo: contasGerente.reduce(
              (acc, c) => acc + (c.saldoPositivo || 0),
              0,
            ),
            totalSaldoNegativo: contasGerente.reduce(
              (acc, c) => acc + (c.saldoNegativo || 0),
              0,
            ),
          };
        }).sort(
          (a, b) => b.totalSaldoPositivo - a.totalSaldoPositivo,
        );
      }),
    );
  }
}

