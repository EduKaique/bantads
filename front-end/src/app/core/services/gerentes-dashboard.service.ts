import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_URL } from '../configs/api.token';
import { ClienteService } from './cliente.service';
import { DashboardEstatisticas } from '../../shared/models/dashboard-estatisticas';
import { Gerente } from '../../shared/models/gerente';
import { GerenteDashboard } from '../../shared/models/gerente-dashboard';
import { GerentesService } from './gerentes.service';
import { ClienteResponse } from '../../shared/models/cliente.models';

interface ContaResumo {
  holderDocument: string;
  availableBalance: number;
  managerDocument?: string;
}

interface DadosDashboard {
  gerentes: Gerente[];
  contas: ContaResumo[];
  clientes: ClienteResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class GerentesDashboardService {
  private readonly http = inject(HttpClient);
  private readonly gerentesService = inject(GerentesService);
  private readonly apiUrl = inject(API_URL);
  private readonly clienteService = inject(ClienteService);

  obterEstatisticas(): Observable<DashboardEstatisticas> {
    return this.obterDadosDashboard().pipe(
      map(({ gerentes, clientes, contas }) => {
        const resumosGerentes = gerentes.map((gerente) =>
          this.calcularResumoFinanceiroGerente(gerente.cpf, clientes, contas),
        );
        const totalGerentesPositivos = resumosGerentes.filter(
          (resumo) => resumo.saldoNegativo <= resumo.saldoPositivo,
        ).length;

        return {
          totalGerentes: gerentes.length,
          totalClientes: resumosGerentes.reduce(
            (total, resumo) => total + resumo.totalClientes,
            0,
          ),
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
      gerentes: this.gerentesService.listar(),
      contas: this.http.get<ContaResumo[]>(`${this.apiUrl}/contas`),
      clientes: this.clienteService.listarTodosClientes(),
    });
  }

  private mapearGerenteDashboard(
    gerente: Gerente,
    clientes: ClienteResponse[],
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
    clientes: ClienteResponse[],
    contas: ContaResumo[],
  ): {
    totalClientes: number;
    saldoPositivo: number;
    saldoNegativo: number;
  } {
    const cpfGerenteNormalizado = this.normalizarCpf(cpfGerente);
    const contasGerente = contas.filter(
      (conta) =>
        this.normalizarCpf(conta.managerDocument || '') ===
        cpfGerenteNormalizado,
    );

    const cpfsClientes = new Set<string>();

    contasGerente.forEach((conta) => {
      this.adicionarCpf(cpfsClientes, conta.holderDocument);
    });

    clientes
      .filter(
        (cliente) =>
          this.normalizarCpf(this.obterCpfGerente(cliente)) ===
          cpfGerenteNormalizado,
      )
      .forEach((cliente) => {
        this.adicionarCpf(cpfsClientes, cliente.cpf);
      });

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

  private adicionarCpf(cpfs: Set<string>, cpf: string): void {
    const cpfNormalizado = this.normalizarCpf(cpf);

    if (cpfNormalizado) {
      cpfs.add(cpfNormalizado);
    }
  }

  private obterCpfGerente(cliente: ClienteResponse): string {
    return cliente.cpfGerente || cliente.cpfGerenteResponsavel || '';
  }
}
