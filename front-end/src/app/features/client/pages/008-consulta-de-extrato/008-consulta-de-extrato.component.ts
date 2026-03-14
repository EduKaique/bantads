import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MOCK_TRANSACTIONS, Transaction } from '../../../../../assets/mock/transactions.mock';

interface GrupoTransacoes {
  data: string;
  saldoDoDia: string;
  transacoes: Transaction[];
}

@Component({
  selector: 'app-consulta-extrato',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, FormsModule],
  templateUrl: './008-consulta-de-extrato.html',
  styleUrls: ['./008-consulta-de-extrato.css'],
})
export class ConsultaExtratoPageComponent implements OnInit {
  @ViewChild('pickerInicio') pickerInicio: any;
  @ViewChild('pickerFim') pickerFim: any;

  dataInicio = '01/01/2026';
  dataFim = '31/12/2026';

  dataSelecionadaInicio: Date = new Date(2026, 0, 1);
  dataSelecionadaFim: Date = new Date(2026, 11, 31);

  transacoes: Transaction[] = MOCK_TRANSACTIONS;
  transacoesPorData: GrupoTransacoes[] = [];

  ngOnInit(): void {
    this.filtrarEAgruparTransacoes();
  }

  estaBetweenDatas(dataTransacao: string, dataInicial: string, dataFinal: string): boolean {
    // Converte DD/MM/YYYY para Date simples e compara
    const txDate = this.converterStringParaDate(dataTransacao);
    const initialDate = this.converterStringParaDate(dataInicial);
    const finalDate = this.converterStringParaDate(dataFinal);
    
    return txDate >= initialDate && txDate <= finalDate;
  }

  private converterStringParaDate(dataStr: string): Date {
    // Converte DD/MM/YYYY para Date
    const [dia, mes, ano] = dataStr.split('/');
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  }

  filtrarEAgruparTransacoes(): void {
    const grupoMapa = new Map<string, GrupoTransacoes>();

    for (const transacao of this.transacoes) {
      const data = transacao.data;
      
      // Check if transaction is within the selected date range
      if (!this.estaBetweenDatas(data, this.dataInicio, this.dataFim)) {
        continue;
      }
      
      if (!grupoMapa.has(data)) {
        // Find the balance for this date
        const transacaoSaldo = this.transacoes.find(
          t => t.data === data && t.isSaldoRow
        );
        const saldoDoDia = transacaoSaldo
          ? transacaoSaldo.operacao.replace('Saldo do dia: ', '')
          : 'R$ 0,00';

        grupoMapa.set(data, {
          data: this.formatarData(data),
          saldoDoDia,
          transacoes: [],
        });
      }

      // Add non-balance transactions
      if (!transacao.isSaldoRow) {
        grupoMapa.get(data)!.transacoes.push(transacao);
      }
    }

    this.transacoesPorData = Array.from(grupoMapa.values());
  }

  aoMudarData(): void {
    this.filtrarEAgruparTransacoes();
  }

  formatarData(dataStr: string): string {
    // Convert DD/MM/YYYY to more readable format with day of week
    const [dia, mes, ano] = dataStr.split('/');
    const data = new Date(`${ano}-${mes}-${dia}`);
    
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
      this.aoMudarData();
    }
  }

  onDataFimChange(event: any): void {
    if (event.value) {
      this.dataFim = this.formatarDataParaInput(event.value);
      this.aoMudarData();
    }
  }

  private formatarDataParaInput(data: Date | null): string {
    if (!data) return '';
    // Simplesmente formata a data como DD/MM/YYYY
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
}