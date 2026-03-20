import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { formatCurrency } from '../../../../shared/utils/formatters';

export interface SaqueConfirmacaoData {
  valor: number;
}

@Component({
  selector: 'app-saque-confirmacao-modal',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './saque-confirmacao-modal.component.html',
  styleUrls: ['./saque-confirmacao-modal.component.css'],
})

export class SaqueConfirmacaoModalComponent {

  get valorFormatado(): string {
    return formatCurrency(this.data.valor);
  }

  constructor(
    public dialogRef: MatDialogRef<SaqueConfirmacaoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaqueConfirmacaoData
  ) {}

  onCancelar(): void {
    this.dialogRef.close(false);
  }

  onConfirmar(): void {
    this.dialogRef.close(true);
  }
}