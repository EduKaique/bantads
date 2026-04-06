import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { CardMenu } from '../../../../shared/components/card-menu/card-menu';

@Component({
  selector: 'app-dashboard-gerente',
  imports: [MatIconModule, CardMenu],
  templateUrl: './dashboard-gerente.html',
  styleUrl: './dashboard-gerente.css',
})
export class DashboardGerenteComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly nomeUsuario = signal('Gerente BanTads');

  readonly tituloBoasVindas = computed(
    () => `Bem vindo de volta, ${this.nomeUsuario()}!`,
  );

  constructor() {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.tipo === 'gerente' && currentUser.nome?.trim()) {
      this.nomeUsuario.set(currentUser.nome.trim());
    }
  }

  irPara(rota: string): void {
    this.router.navigate([`/gerente/${rota}`]);
  }
}
