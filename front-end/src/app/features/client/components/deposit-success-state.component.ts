import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { formatDateBR, formatTimeBR } from '../../../shared/utils/formatters';

@Component({
  selector: 'app-deposit-success-state',
  templateUrl: './deposit-success-state.component.html',
  styleUrl: './deposit-success-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositSuccessStateComponent {
  @Input({ required: true }) performedAt = '';

  get formattedDate(): string {
    return formatDateBR(this.performedAt);
  }

  get formattedTime(): string {
    return formatTimeBR(this.performedAt);
  }
}