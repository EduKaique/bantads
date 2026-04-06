import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_URL } from '../../../core/configs/api.token';
import { GerenteDashboard } from '../../../shared/models/gerente-dashboard';
import { DashboardEstatisticas } from '../../../shared/models/dashboard-estatisticas';
import { Gerente } from '../../../shared/models/gerente';

@Injectable({
  providedIn: 'root',
})
export class GerentesDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private normalizarCpf(cpf: string): string {
    return cpf ? cpf.replace(/\D/g, '') : '';
  }

  obterEstatisticas(): Observable<DashboardEstatisticas> {
    return forkJoin({
      gerentes: this.http.get<Gerente[]>(`${this.apiUrl}/gerentes`),
      contas: this.http.get<any[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<any[]>(`${this.apiUrl}/clientes`),
    }).pipe(
      map(({ gerentes, contas, clientes }) => {
        const totalGerentes = gerentes.length;
        const totalClientes = clientes.length;

        // Calcular saldo líquido de cada gerente
        let totalGerentesPositivos = 0;
        let totalGerentesNegativos = 0;

        gerentes.forEach((g) => {
          const cpfGerenteNorm = this.normalizarCpf(g.cpf);

          const contasDoGerente = contas.filter((conta) => {
             const managerNorm = this.normalizarCpf(conta.managerDocument);
             return managerNorm === cpfGerenteNorm;
          });

          // Soma os saldos das contas do gerente
          let saldoPositivoTotal = 0;
          let saldoNegativoTotal = 0;

          contasDoGerente.forEach(conta => {
             const saldo = conta.availableBalance || 0;
             if (saldo >= 0) {
               saldoPositivoTotal += saldo;
             } else {
               saldoNegativoTotal += Math.abs(saldo);
             }
          });

          // Se saldoNegativo <= saldoPositivo, gerente é positivo
          if (saldoNegativoTotal <= saldoPositivoTotal) {
             totalGerentesPositivos++;
          } else {
             totalGerentesNegativos++;
          }
        });

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
      contas: this.http.get<any[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<any[]>(`${this.apiUrl}/clientes`),
    }).pipe(
      map(({ gerentes, contas }) => {
        return gerentes.map((gerente) => {
          const cpfGerenteNorm = this.normalizarCpf(gerente.cpf);

          const contasGerente = contas.filter((conta) => {
            const managerNorm = this.normalizarCpf(conta.managerDocument);
            return managerNorm === cpfGerenteNorm;
          });

          let totalSaldoPositivo = 0;
          let totalSaldoNegativo = 0;

          contasGerente.forEach(conta => {
             const saldo = conta.availableBalance || 0;
             if (saldo >= 0) {
               totalSaldoPositivo += saldo;
             } else {
               totalSaldoNegativo += Math.abs(saldo);
             }
          });

          return {
            ...gerente,
            totalClientes: contasGerente.length,
            totalSaldoPositivo,
            totalSaldoNegativo,
          };
        }).sort((a, b) => b.totalSaldoPositivo - a.totalSaldoPositivo);
      }),
    );
  }
}