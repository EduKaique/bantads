import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CardMenu } from '../../../../shared/components/card-menu/card-menu';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pagina-inicial',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe, CardMenu],
  templateUrl: './pagina-inicial.html',
  styleUrl: './pagina-inicial.css',
})
export class PaginaInicial {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly saldo = signal(0);
  readonly nomeUsuario = signal('Cliente BanTads');

  tituloVariavelSaldo = computed(() => 
    this.saldo() >= 0 
      ? `Bem vindo de volta, ${this.nomeUsuario()}!` 
      : `Pague o que me deve, ${this.nomeUsuario()}!`
  );

  constructor() {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.nome?.trim()) {
      this.nomeUsuario.set(currentUser.nome.trim());
    }

    if (currentUser?.cpf) {
      this.carregarDadosConta(currentUser.cpf);
    } else {
      console.error('Usuário não identificado');
    }
  }

  private carregarDadosConta(cpf: string): void {
    this.http.get<any>(`http://localhost:3000/contas/cpf/${cpf}`)
      .subscribe({
        next: (dadosConta) => {
          this.saldo.set(dadosConta.saldoDisponivel || 0);

          if (dadosConta.nome?.trim()) {
            this.nomeUsuario.set(dadosConta.nome.trim());
          }
        },
        error: (erro) => {
          console.error('Erro ao buscar dados da conta:', erro);
        }
      });
  }

  irPara(rota: string) {
    this.router.navigate([`/cliente/${rota}`]);
  } 
}