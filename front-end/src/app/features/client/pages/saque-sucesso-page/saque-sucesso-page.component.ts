import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saque-sucesso-page',
  standalone: true,
  imports: [],
  templateUrl: './saque-sucesso-page.component.html',
  styleUrls: ['./saque-sucesso-page.component.css'],
})
export class SaqueSucessoPageComponent {
  valorSacado: number = 0;
  dataHora: Date = new Date();

  get valorFormatado(): string {
    return this.valorSacado.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  get dataFormatada(): string {
    return this.dataHora.toLocaleDateString('pt-BR');
  }

  get horaFormatada(): string {
    return this.dataHora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as
      | { valor: number; dataHora: string }
      | undefined;

    if (state?.valor) {
      this.valorSacado = state.valor;
      this.dataHora = new Date(state.dataHora);
    } else {
      this.router.navigate(['/cliente/saque']);
    }
  }

  voltarDashboard(): void {
    this.router.navigate(['/cliente/home']);
  }

  novoSaque(): void {
    this.router.navigate(['/cliente/saque']);
  }
}
