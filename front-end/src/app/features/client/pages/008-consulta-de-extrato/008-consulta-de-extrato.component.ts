import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';

import { Transaction } from '../../../../../assets/mock/transactions.mock';
import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  buildScopedStorageKey,
  PREFIXO_FILTRO_EXTRATO,
  PREFIXO_PRIMEIRO_ACESSO_EXTRATO,
} from '../../../../shared/utils/session-storage.utils';
import {
  criarGruposTransacoes,
  desserializarFiltroExtrato,
  GrupoTransacoes,
  mapearMovimentacoesDoExtrato,
  MovimentacaoExtratoApi,
  serializarFiltroExtrato,
} from './008-consulta-de-extrato.utils';

interface ContaPorCpfResponse {
  numeroConta: string;
  saldoDisponivel: number;
}

interface ExtratoResponse {
  conta: string;
  saldo: number;
  movimentacoes: MovimentacaoExtratoApi[];
}

@Component({
  selector: 'app-consulta-extrato',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  templateUrl: './008-consulta-de-extrato.html',
  styleUrls: ['./008-consulta-de-extrato.css'],
})
export class ConsultaExtratoPageComponent implements OnInit {
  private readonly apiContaUrl = 'http://localhost:8084/contas';
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly saldoAtual = signal(0);

  dataSelecionadaInicio = new Date(2026, 0, 1);
  dataSelecionadaFim = new Date(2026, 11, 31);
  transacoesPorData: GrupoTransacoes[] = [];

  private transacoes: Transaction[] = [];

  ngOnInit(): void {
    this.configurarFiltroInicialDaSessao();
    this.carregarExtrato();
  }

  obterIconeOperacao(operacao: string): string {
    if (operacao.includes('Saque')) {
      return 'call_received';
    }

    if (operacao.includes('Depósito')) {
      return 'call_made';
    }

    if (operacao.includes('Transferência')) {
      return 'compare_arrows';
    }

    return 'attach_money';
  }

  onDataInicioChange(event: { value: Date | null }): void {
    if (!event.value) {
      return;
    }

    this.dataSelecionadaInicio = event.value;
    this.persistirFiltroDaSessao();
    this.filtrarEAgruparTransacoes();
  }

  onDataFimChange(event: { value: Date | null }): void {
    if (!event.value) {
      return;
    }

    this.dataSelecionadaFim = event.value;
    this.persistirFiltroDaSessao();
    this.filtrarEAgruparTransacoes();
  }

  private carregarExtrato(): void {
    const cpf = this.authService.currentUserValue?.cpf;

    if (!cpf) {
      this.transacoes = [];
      this.saldoAtual.set(0);
      this.filtrarEAgruparTransacoes();
      return;
    }

    this.http
      .get<ContaPorCpfResponse>(`${this.apiContaUrl}/cpf/${cpf}`)
      .pipe(
        switchMap((conta) =>
          this.http.get<ExtratoResponse>(`${this.apiContaUrl}/${conta.numeroConta}/extrato`).pipe(
            map((extrato) => ({
              numeroConta: conta.numeroConta,
              extrato,
            })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ numeroConta, extrato }) => {
          this.saldoAtual.set(extrato.saldo);
          this.transacoes = mapearMovimentacoesDoExtrato(
            extrato.movimentacoes,
            numeroConta,
          );
          this.filtrarEAgruparTransacoes();
        },
        error: () => {
          this.saldoAtual.set(0);
          this.transacoes = [];
          this.filtrarEAgruparTransacoes();
        },
      });
  }

  private configurarFiltroInicialDaSessao(): void {
    const chavePrimeiroAcesso = this.buildSessionStorageKey();
    const chaveFiltro = this.buildSessionFilterStorageKey();
    const filtroPersistido = sessionStorage.getItem(chaveFiltro);

    if (filtroPersistido) {
      this.aplicarFiltroPersistido(filtroPersistido);
      return;
    }

    if (sessionStorage.getItem(chavePrimeiroAcesso)) {
      return;
    }

    const hoje = new Date();
    this.dataSelecionadaInicio = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      0,
      0,
      0,
      0,
    );
    this.dataSelecionadaFim = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate(),
      23,
      59,
      59,
      999,
    );
    sessionStorage.setItem(chavePrimeiroAcesso, 'true');
    this.persistirFiltroDaSessao();
  }

  private aplicarFiltroPersistido(filtroPersistido: string): void {
    const filtro = desserializarFiltroExtrato(filtroPersistido);

    if (!filtro) {
      sessionStorage.removeItem(this.buildSessionFilterStorageKey());
      return;
    }

    this.dataSelecionadaInicio = filtro.dataInicio;
    this.dataSelecionadaFim = filtro.dataFim;
  }

  private persistirFiltroDaSessao(): void {
    sessionStorage.setItem(
      this.buildSessionFilterStorageKey(),
      serializarFiltroExtrato(
        this.dataSelecionadaInicio,
        this.dataSelecionadaFim,
      ),
    );
  }

  private filtrarEAgruparTransacoes(): void {
    this.transacoesPorData = criarGruposTransacoes(
      this.transacoes,
      this.dataSelecionadaInicio,
      this.dataSelecionadaFim,
      this.saldoAtual(),
    );
  }

  private buildSessionStorageKey(): string {
    return buildScopedStorageKey(
      PREFIXO_PRIMEIRO_ACESSO_EXTRATO,
      this.authService.currentUserValue,
    );
  }

  private buildSessionFilterStorageKey(): string {
    return buildScopedStorageKey(
      PREFIXO_FILTRO_EXTRATO,
      this.authService.currentUserValue,
    );
  }
}
