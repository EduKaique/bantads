import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ConsultasGerenciaisService } from '../../../../core/services/consultas-gerenciais.service';
import { ClienteCarteira } from '../../../../shared/models/consultas-gerenciais';
import { formatCpf } from '../../../../shared/utils/formatters';

export type Cliente = ClienteCarteira;

@Component({
  selector: 'app-consultar-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consultar-clientes.html',
  styleUrls: ['./consultar-clientes.css'],
})
export class ConsultarClientesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly consultasGerenciaisService = inject(ConsultasGerenciaisService);

  tipoFiltro: 'nome' | 'cpf' = 'nome';
  termoBusca = '';

  paginaAtual = 1;
  itensPorPagina = 5;
  clientesPaginados: Cliente[] = [];

  clientes: Cliente[] = [];
  clientesExibidos: Cliente[] = [];
  carregando = true;

  ngOnInit(): void {
    this.carregarClientesDaAPI();
  }

  formatarCpf(cpf: string): string {
    if (!cpf || cpf === '-') return '-';

    const cpfNormalizado = cpf.replace(/\D/g, '');

    if (cpfNormalizado.length !== 11) return cpf;

    return cpfNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  carregarClientesDaAPI(): void {
    this.carregando = true;

    const gerenteLogado = this.authService.currentUserValue;
    const cpfGerenteLogado = gerenteLogado?.cpf ? gerenteLogado.cpf.replace(/\D/g, '') : '';

    if (!cpfGerenteLogado) {
      this.clientes = [];
      this.clientesExibidos = [];
      this.atualizarPaginacao();
      this.carregando = false;
      return;
    }

    this.consultasGerenciaisService
      .listarClientesDoGerente(cpfGerenteLogado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clientes) => {
          this.clientes = clientes;
          this.ordenarClientesPorNome();
          this.clientesExibidos = [...this.clientes];
          this.atualizarPaginacao();
          this.carregando = false;
        },
        error: () => {
          this.clientes = [];
          this.clientesExibidos = [];
          this.atualizarPaginacao();
          this.carregando = false;
        },
      });
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesExibidos.length / this.itensPorPagina);
  }

  ordenarClientesPorNome(): void {
    this.clientes.sort((atual, proximo) => atual.nome.localeCompare(proximo.nome, 'pt-BR'));
  }

  filtrarClientes(): void {
    if (!this.termoBusca.trim()) {
      this.clientesExibidos = [...this.clientes];
    } else {
      const termo = this.termoBusca.toLowerCase().trim();

      this.clientesExibidos = this.clientes.filter((cliente) => {
        if (this.tipoFiltro === 'nome') {
          return cliente.nome.toLowerCase().includes(termo);
        }

        const cpfLimpo = cliente.cpf.replace(/\D/g, '');
        const termoLimpo = termo.replace(/\D/g, '');

        return cpfLimpo.includes(termoLimpo) || cliente.cpf.includes(termo);
      });
    }

    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  atualizarPaginacao(): void {
    const indiceInicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const indiceFim = indiceInicio + this.itensPorPagina;
    this.clientesPaginados = this.clientesExibidos.slice(indiceInicio, indiceFim);
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.atualizarPaginacao();
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.atualizarPaginacao();
    }
  }

  onBuscaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    if (this.tipoFiltro === 'cpf') {
      valor = formatCpf(valor);
    } else if (this.tipoFiltro === 'nome') {
      valor = valor.replace(/\d/g, '');
    }

    this.termoBusca = valor;
    input.value = valor;

    this.filtrarClientes();
  }

  onTipoFiltroChange(): void {
    this.termoBusca = '';
    this.filtrarClientes();
  }
}
