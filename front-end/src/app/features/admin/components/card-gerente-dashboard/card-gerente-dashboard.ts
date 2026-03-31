import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GerenteDashboard } from '../../../../shared/models/gerente-dashboard';
import { formatCurrency } from '../../../../shared/utils/formatters';

@Component({
  selector: 'app-card-gerente-dashboard',
  imports: [CommonModule],
  templateUrl: './card-gerente-dashboard.html',
  styleUrl: './card-gerente-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardGerenteDashboardComponent {
  private readonly router = inject(Router);
  
  @Input({ required: true }) gerente!: GerenteDashboard;

  formatarMoeda = formatCurrency;

  obterIniciais(): string {
    return this.gerente.nome
      .split(' ')
      .map((palavra) => palavra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  irParaListaGerentes(): void {
    this.router.navigate(['/admin/listar-gerentes']);
  }
}
