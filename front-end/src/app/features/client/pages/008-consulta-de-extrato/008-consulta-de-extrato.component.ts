import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MOCK_TRANSACTIONS, Transaction } from '../../../../../assets/mock/transactions.mock';

@Component({
  selector: 'app-consulta-extrato',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './008-consulta-de-extrato.html',
  styleUrls: ['./008-consulta-de-extrato.css'],
})
export class ConsultaExtratoPageComponent {
  paymentsIcon =
    'https://www.figma.com/api/mcp/asset/eacafc04-06ef-4d09-9788-7c9d3c8e6521';

  periodStart = '01/03/2026';
  periodEnd = '08/03/2026';
  balanceLabel = 'Saldo em conta';
  balance = 1000;

  isEditingPeriod = false;
  tempPeriodStart = '';
  tempPeriodEnd = '';

  transactions: Transaction[] = MOCK_TRANSACTIONS;

  generateReport(): void {
    console.log('Generate report clicked');
  }

  startEditingPeriod(): void {
    this.isEditingPeriod = true;
    this.tempPeriodStart = this.periodStart;
    this.tempPeriodEnd = this.periodEnd;
  }

  savePeriod(): void {
    if (this.tempPeriodStart && this.tempPeriodEnd) {
      this.periodStart = this.tempPeriodStart;
      this.periodEnd = this.tempPeriodEnd;
    }
    this.isEditingPeriod = false;
  }

  cancelEditingPeriod(): void {
    this.isEditingPeriod = false;
  }
}