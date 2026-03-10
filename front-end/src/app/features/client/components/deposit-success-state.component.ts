import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-deposit-success-state',
  templateUrl: './deposit-success-state.component.html',
  styleUrl: './deposit-success-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositSuccessStateComponent {
  @Input({ required: true }) performedAt = '';

  private readonly dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  private readonly timeFormatter = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  get formattedDate(): string {
    return this.getSafeDateValue((date) => this.dateFormatter.format(date));
  }

  get formattedTime(): string {
    return this.getSafeDateValue((date) =>
      this.timeFormatter.format(date).replace(':', 'h')
    );
  }

  private getSafeDateValue(formatter: (date: Date) => string): string {
    const parsedDate = new Date(this.performedAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return '--';
    }

    return formatter(parsedDate);
  }
}
