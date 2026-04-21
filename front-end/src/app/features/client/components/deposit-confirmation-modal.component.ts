import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { InputPrimaryComponent } from '../../../shared/components/input-primary/input-primary.component';

@Component({
  selector: 'app-deposit-confirmation-modal',
  standalone: true,
  imports: [InputPrimaryComponent],
  templateUrl: './deposit-confirmation-modal.component.html',
  styleUrl: './deposit-confirmation-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositConfirmationModalComponent {
  @Input() visible = false;
  @Input() formattedAmount = '';
  @Input() isBusy = false;
  @Input() title = 'Confirmar depósito';
  @Input() description = 'Confira o valor abaixo antes de concluir a operação.';
  @Input() question = 'Tem certeza que deseja depositar';
  @Input() detailLines: string[] = [];
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() amountLabel = 'Valor da operação';

  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  onCancel(): void {
    if (!this.isBusy) {
      this.cancelled.emit();
    }
  }

  onConfirm(): void {
    if (!this.isBusy) {
      this.confirmed.emit();
    }
  }
}
