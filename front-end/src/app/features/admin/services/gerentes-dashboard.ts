import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '../../../core/configs/api.token';
import { DashboardEstatisticas } from '../../../shared/models/dashboard-estatisticas';
import { Gerente } from '../../../shared/models/gerente';
import { GerenteDashboard } from '../../../shared/models/gerente-dashboard';

interface ClienteResumo {
  cpf: string;
  cpfGerente: string;
}

interface ContaResumo {
  holderDocument: string;
  availableBalance: number;
}

interface DadosDashboard {
  gerentes: Gerente[];
  contas: ContaResumo[];
  clientes: ClienteResumo[];
}

@Injectable({
  providedIn: 'root',
})
export class GerentesDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  obterEstatisticas(): Observable<DashboardEstatisticas> {
    return this.obterDadosDashboard().pipe(
      map(({ gerentes, clientes, contas }) => {
        const totalGerentesPositivos = gerentes.filter((gerente) => {
          const resumo = this.calcularResumoFinanceiroGerente(
            gerente.cpf,
            clientes,
            contas,
          );

          return resumo.saldoNegativo <= resumo.saldoPositivo;
        }).length;

        return {
          totalGerentes: gerentes.length,
          totalClientes: clientes.length,
          totalGerentesPositivos,
          totalGerentesNegativos: gerentes.length - totalGerentesPositivos,
        };
      }),
    );
  }

  obterGerentesComDados(): Observable<GerenteDashboard[]> {
    return this.obterDadosDashboard().pipe(
      map(({ gerentes, clientes, contas }) =>
        gerentes
          .map((gerente) =>
            this.mapearGerenteDashboard(gerente, clientes, contas),
          )
          .sort(
            (gerenteA, gerenteB) =>
              gerenteB.totalSaldoPositivo - gerenteA.totalSaldoPositivo,
          ),
      ),
    );
  }

  private obterDadosDashboard(): Observable<DadosDashboard> {
    return forkJoin({
      gerentes: this.http.get<Gerente[]>(`${this.apiUrl}/gerentes`),
      contas: this.http.get<ContaResumo[]>(`${this.apiUrl}/contas`),
      clientes: this.http.get<ClienteResumo[]>(`${this.apiUrl}/clientes`),
    });
  }

  private mapearGerenteDashboard(
    gerente: Gerente,
    clientes: ClienteResumo[],
    contas: ContaResumo[],
  ): GerenteDashboard {
    const resumo = this.calcularResumoFinanceiroGerente(
      gerente.cpf,
      clientes,
      contas,
    );

    return {
      ...gerente,
      totalClientes: resumo.totalClientes,
      totalSaldoPositivo: resumo.saldoPositivo,
      totalSaldoNegativo: resumo.saldoNegativo,
    };
  }

  private calcularResumoFinanceiroGerente(
    cpfGerente: string,
    clientes: ClienteResumo[],
    contas: ContaResumo[],
  ): {
    totalClientes: number;
    saldoPositivo: number;
    saldoNegativo: number;
  } {
    const cpfsClientes = new Set(
      clientes
        .filter(
          (cliente) =>
            this.normalizarCpf(cliente.cpfGerente) ===
            this.normalizarCpf(cpfGerente),
        )
        .map((cliente) => this.normalizarCpf(cliente.cpf)),
    );

    const contasGerente = contas.filter((conta) =>
      cpfsClientes.has(this.normalizarCpf(conta.holderDocument)),
    );

    return {
      totalClientes: cpfsClientes.size,
      saldoPositivo: contasGerente.reduce(
        (total, conta) => total + Math.max(0, conta.availableBalance),
        0,
      ),
      saldoNegativo: contasGerente.reduce(
        (total, conta) => total + Math.max(0, -conta.availableBalance),
        0,
      ),
    };
  }

  private normalizarCpf(cpf: string): string {
    return cpf ? cpf.replace(/\D/g, '') : '';
  }
}
