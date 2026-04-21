import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';

@Component({
  selector: 'app-saque-sucesso-page',
  standalone: true,
  imports: [AppSuccessModalComponent],
  templateUrl: './saque-sucesso-page.component.html',
  styleUrls: ['./saque-sucesso-page.component.css'],
})
export class SaqueSucessoPageComponent {
  mostrarModal = true;
  valorSacado = 0;
  dataHora = new Date();

  get valorFormatado(): string {
    return this.valorSacado.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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
