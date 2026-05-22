import { Component, computed, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CardMenu } from '../../../../shared/components/card-menu/card-menu';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ContaService } from '../../../../core/services/conta.service';

@Component({
  selector: 'app-pagina-inicial',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe, CardMenu],
  templateUrl: './pagina-inicial.html',
  styleUrl: './pagina-inicial.css',
})
export class PaginaInicial implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly clienteService = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  
  private readonly contaService = inject(ContaService);

  readonly saldo = signal(0);
  readonly nomeUsuario = signal('Cliente BanTads');

  tituloVariavelSaldo = computed(() => 
    this.saldo() >= 0 
      ? `Bem vindo de volta, ${this.nomeUsuario()}!` 
      : `Pague o que me deve, ${this.nomeUsuario()}!`
  );

  constructor() {}
  
  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.nome?.trim()) {
      this.nomeUsuario.set(currentUser.nome.trim());
    }

    if (currentUser?.cpf) {
      this.carregarDadosConta(currentUser.cpf);
    } else {
      console.error('Usuário não identificado na sessão');
    }
  }

  private carregarDadosConta(cpf: string): void {
    this.contaService.buscarContaPorCpf(cpf)
      .subscribe({
        next: (dadosConta) => {
          this.saldo.set(dadosConta.saldoDisponivel || 0);
        },
        error: (erro: any) => {
          console.error('Erro ao buscar dados da conta via Service:', erro);
        }
      });
  }

  irPara(rota: string) {
    this.router.navigate([`/cliente/${rota}`]);
  } 
}
