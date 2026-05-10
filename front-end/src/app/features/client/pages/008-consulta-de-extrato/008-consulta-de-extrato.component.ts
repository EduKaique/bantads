import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClientAccountService } from '../../services/client-account.service';
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
import { ExtratoTransaction } from './extrato-transaction.model';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly clientAccountService = inject(ClientAccountService);

  readonly saldoAtual = signal(0);
  readonly erroCarregamento = signal<string | null>(null);

  dataSelecionadaInicio = new Date(new Date().getFullYear(), 0, 1);
  dataSelecionadaFim = new Date();
  transacoesPorData: GrupoTransacoes[] = [];

  private transacoes: ExtratoTransaction[] = [];

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

  isSaldoAtualNegativo(): boolean {
    return this.saldoAtual() < 0;
  }

  onDataInicioChange(event: { value: Date | null }): void {
    if (!event.value) {
      return;
    }

    // Validar se a data inicial não é posterior à data final
    if (event.value > this.dataSelecionadaFim) {
      this.erroCarregamento.set('Data inicial não pode ser posterior à data final');
      return;
    }

    this.dataSelecionadaInicio = event.value;
    this.erroCarregamento.set(null);
    this.persistirFiltroDaSessao();
    this.filtrarEAgruparTransacoes();
  }

  onDataFimChange(event: { value: Date | null }): void {
    if (!event.value) {
      return;
    }

    // Validar se a data final não é anterior à data inicial
    if (event.value < this.dataSelecionadaInicio) {
      this.erroCarregamento.set('Data final não pode ser anterior à data inicial');
      return;
    }

    this.dataSelecionadaFim = event.value;
    this.erroCarregamento.set(null);
    this.persistirFiltroDaSessao();
    this.filtrarEAgruparTransacoes();
  }

  private carregarExtrato(): void {
    const cpf = this.authService.currentUserValue?.cpf;

    if (!cpf) {
      this.transacoes = [];
      this.saldoAtual.set(0);
      this.erroCarregamento.set('Usuário não autenticado');
      this.filtrarEAgruparTransacoes();
      return;
    }

    this.clientAccountService.getExtratoAtual().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (extrato) => {
        this.saldoAtual.set(extrato.saldoAtual);
        const movimentacoes: MovimentacaoExtratoApi[] = extrato.transacoes.map(t => ({
          data: t.dataHora,
          tipo: t.tipo.toLowerCase(),
          origem: t.contaOrigem,
          destino: t.contaDestino,
          valor: t.valor,
        }));
        this.transacoes = mapearMovimentacoesDoExtrato(
          movimentacoes,
          extrato.numeroConta,
        );
        this.erroCarregamento.set(null);
        this.filtrarEAgruparTransacoes();
      },
      error: (erro) => {
        this.saldoAtual.set(0);
        this.transacoes = [];
        this.erroCarregamento.set('Erro ao carregar extrato. Tente novamente mais tarde.');
        this.filtrarEAgruparTransacoes();
        console.error('Erro ao carregar extrato:', erro);
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
