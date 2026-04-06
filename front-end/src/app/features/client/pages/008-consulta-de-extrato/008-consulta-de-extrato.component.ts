import { Component, OnInit, ViewChild, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MOCK_TRANSACTIONS, Transaction } from '../../../../../assets/mock/transactions.mock';
import { ClientAccountService } from '../../services/client-account.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

interface GrupoTransacoes {
  data: string;
  saldoDoDia: string;
  transacoes: Transaction[];
}

@Component({
  selector: 'app-consulta-extrato',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, FormsModule],
  templateUrl: './008-consulta-de-extrato.html',
  styleUrls: ['./008-consulta-de-extrato.css'],
})
export class ConsultaExtratoPageComponent implements OnInit {
  @ViewChild('pickerInicio') pickerInicio: any;
  @ViewChild('pickerFim') pickerFim: any;

  private readonly destroyRef = inject(DestroyRef);
  private readonly clientAccountService = inject(ClientAccountService);
  private readonly authService = inject(AuthService);

  readonly saldoAtual = signal(0);

  dataInicio = '01/01/2026';
  dataFim = '31/12/2026';

  dataSelecionadaInicio: Date = new Date(2026, 0, 1);
  dataSelecionadaFim: Date = new Date(2026, 11, 31);

  transacoes: Transaction[] = MOCK_TRANSACTIONS;
  transacoesPorData: GrupoTransacoes[] = [];

  ngOnInit(): void {
    this.carregarSaldoAtual();
    this.carregarTransacoesDoLocalStorage();
  }

  private buildStorageKey(): string {
    const currentUser = this.authService.currentUserValue;
    const sessionKey = currentUser?.tipo === 'cliente'
      ? this.normalizeStorageKeySegment(currentUser.email || currentUser.nome || 'cliente')
      : 'local-demo';
    return `client-account-state:${sessionKey}`;
  }

  private normalizeStorageKeySegment(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')     // Replace special chars with dash
      .replace(/(^-|-$)/g, '');         // Remove leading/trailing dashes
  }

  private carregarTransacoesDoLocalStorage(): void {
    try {
      // Tenta carregar do localStorage a conta com suas transações
      const storageKey = this.buildStorageKey();
      const storedAccounts = localStorage.getItem(storageKey);
      if (storedAccounts) {
        const account = JSON.parse(storedAccounts);
        if (account.transactions && Array.isArray(account.transactions)) {
          // Converter transações do formato AccountTransaction para Transaction
          const transacoesDoLocalStorage = account.transactions.map((tx: any) => ({
            data: this.converterDataIso(tx.performedAt),
            hora: this.extrairHoraDoData(tx.performedAt),
            operacao: this.mapearTipoOperacao(tx.type),
            remetenteDestinatario: 'Você',
            categoria: 'Operação bancária',
            valor: `R$${Math.abs(tx.amount).toFixed(2).replace('.', ',')}`,
            operacaoColor: tx.type === 'withdrawal' ? 'red' : 
                          tx.type === 'deposit' ? 'blue' : 'purple',
          }));

          // Combinar mock + localStorage (localStorage tem prioridade de recência)
          this.transacoes = [...transacoesDoLocalStorage, ...MOCK_TRANSACTIONS];
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar transações do localStorage:', error);
      // Se houver erro, continua só com o mock
    }
  }

  private converterDataIso(dataIso: string): string {
    // Converte de ISO 8601 (2026-03-05T10:30:00Z) para DD/MM/YYYY
    const date = new Date(dataIso);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  private extrairHoraDoData(dataIso: string): string {
    // Extrai HH:MM de ISO 8601
    const date = new Date(dataIso);
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  private mapearTipoOperacao(tipo: string): string {
    if (tipo === 'deposit') return 'Depósito';
    if (tipo === 'withdrawal') return 'Saque';
    if (tipo === 'transfer') return 'Transferência';
    return 'Operação bancária';
  }

  private carregarSaldoAtual(): void {
    this.clientAccountService
      .getCurrentAccount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((account) => {
        this.saldoAtual.set(account.availableBalance);
      });
  }

  private converterStringParaDate(dataStr: string): Date {
    const [dia, mes, ano] = dataStr.split('/');
    const date = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 0, 0, 0, 0);
    return date;
  }

  private dataEstaNoIntervalo(dataTransacao: string): boolean {
    const txDate = this.converterStringParaDate(dataTransacao);
    const dataInicio = this.converterStringParaDate(this.dataInicio);
    const dataFim = this.converterStringParaDate(this.dataFim);
    return txDate >= dataInicio && txDate <= dataFim;
  }

  filtrarEAgruparTransacoes(): void {
    // 1. Gerar TODAS as datas entre dataInicio e dataFim
    const todasAsDatas = this.gerarTodasAsDatas(this.dataInicio, this.dataFim);

    // 2. Criar mapa com grupos para TODAS as datas
    const gruposPorData = new Map<string, GrupoTransacoes>();
    for (const data of todasAsDatas) {
      gruposPorData.set(data, {
        data: this.formatarData(data),
        saldoDoDia: this.obterSaldoDoDia(data),
        transacoes: [],
      });
    }

    // 3. Preencher as transações que existem
    const transacoesFiltradas = this.transacoes.filter(tx => {
      if (tx.isSaldoRow) return false;
      return this.dataEstaNoIntervalo(tx.data);
    });

    for (const tx of transacoesFiltradas) {
      if (gruposPorData.has(tx.data)) {
        gruposPorData.get(tx.data)!.transacoes.push(tx);
      }
    }

    // 4. Ordenar transações dentro de cada dia por hora
    for (const grupo of gruposPorData.values()) {
      grupo.transacoes.sort((a, b) => {
        const horaA = a.hora || '00:00';
        const horaB = b.hora || '00:00';
        return horaA.localeCompare(horaB);
      });
    }

    // 5. Converter para array e ordenar por data decrescente (mais recente primeiro)
    this.transacoesPorData = Array.from(gruposPorData.values()).reverse();
  }

  private gerarTodasAsDatas(dataInicial: string, dataFinal: string): string[] {
    const datas: string[] = [];
    const inicial = this.converterStringParaDate(dataInicial);
    const final = this.converterStringParaDate(dataFinal);
    
    let dataAtual = new Date(inicial);
    
    while (dataAtual <= final) {
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      datas.push(`${dia}/${mes}/${ano}`);
      
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    return datas;
  }


  private obterSaldoDoDia(data: string): string {
    const diaRef = this.converterStringParaDate(data);
    let saldo = this.saldoAtual();

    for (const tx of this.transacoes) {
      if (tx.isSaldoRow) continue;

      const dataTx = this.converterStringParaDate(tx.data);
      if (dataTx > diaRef) {
        const valor = this.parseValor(tx.valor);
        if (tx.operacaoColor === 'blue') {
          saldo -= valor;
        } else {
          saldo += valor;
        }
      }
    }

    return saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private parseValor(valorStr: string): number {
    return parseFloat(
      valorStr
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    ) || 0;
  }


  formatarData(dataStr: string): string {

    const [dia, mes, ano] = dataStr.split('/');
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    
    const opcoes: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    return data.toLocaleDateString('pt-BR', opcoes);
  }

  obterIconeOperacao(operacao: string): string {
    if (operacao.includes('Saque')) {
      return 'call_received';
    } else if (operacao.includes('Depósito')) {
      return 'call_made';
    } else if (operacao.includes('Transferência')) {
      return 'compare_arrows';
    }
    return 'attach_money';
  }

  obterTipoOperacao(operacao: string): string {
    if (operacao.includes('Saque')) {
      return 'Saque';
    } else if (operacao.includes('Depósito')) {
      return 'Depósito';
    } else if (operacao.includes('Transferência')) {
      return 'Transferência';
    }
    return operacao;
  }

  abrirSeletorData(tipo: 'inicio' | 'fim'): void {
    if (tipo === 'inicio' && this.pickerInicio) {
      this.pickerInicio.open();
    } else if (tipo === 'fim' && this.pickerFim) {
      this.pickerFim.open();
    }
  }

  onDataInicioChange(event: any): void {
    if (event.value) {
      this.dataInicio = this.formatarDataParaInput(event.value);
      this.filtrarEAgruparTransacoes();
    }
  }

  onDataFimChange(event: any): void {
    if (event.value) {
      this.dataFim = this.formatarDataParaInput(event.value);
      this.filtrarEAgruparTransacoes();
    }
  }

  private formatarDataParaInput(data: Date | null): string {
    if (!data) return '';

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
}