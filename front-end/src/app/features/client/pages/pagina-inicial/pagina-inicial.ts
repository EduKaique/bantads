import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CardMenu } from '../../../../shared/components/card-menu/card-menu';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClientAccountService } from '../../services/client-account.service';

@Component({
  selector: 'app-pagina-inicial',
  imports: [MatIconModule, CurrencyPipe, CardMenu],
  templateUrl: './pagina-inicial.html',
  styleUrl: './pagina-inicial.css',
})
export class PaginaInicial {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly clientAccountService = inject(ClientAccountService);

  readonly saldo = signal(0);
  readonly nomeUsuario = signal('Cliente BanTads');

  tituloVariavelSaldo = computed(() => 
    this.saldo() >= 0 
      ? `Bem vindo de volta, ${this.nomeUsuario()}!` 
      : `Pague o que me deve, ${this.nomeUsuario()}!`
  );

  constructor() {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.tipo === 'cliente' && currentUser.nome?.trim()) {
      this.nomeUsuario.set(currentUser.nome.trim());
    }

    this.clientAccountService
      .getCurrentAccount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((account) => {
        this.saldo.set(account.availableBalance);

        if (account.holderName.trim()) {
          this.nomeUsuario.set(account.holderName.trim());
        }
      });
  }

  irPara(rota: string) {
    this.router.navigate([`/cliente/${rota}`])
  } 
}
