import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CardMenu } from '../../../../shared/components/card-menu/card-menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-inicial',
  imports: [MatIconModule, CurrencyPipe, CardMenu],
  templateUrl: './pagina-inicial.html',
  styleUrl: './pagina-inicial.css',
})
export class PaginaInicial {
  saldo = signal(2034.00); 
  nomeUsuario = signal("Diddy");
  private router = inject(Router);

  tituloVariavelSaldo = computed(() => 
    this.saldo() >= 0 
      ? `Bem vindo de volta, ${this.nomeUsuario()}!` 
      : `Pague o que me deve, ${this.nomeUsuario()}!`
  );

  irPara(rota: string) {
    this.router.navigate([`/cliente/${rota}`])
  } 
}
