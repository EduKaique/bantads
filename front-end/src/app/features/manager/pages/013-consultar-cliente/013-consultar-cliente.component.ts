import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DetalheClienteService, ClienteDetalhado } from '../../services/detalhe-cliente.service';

@Component({
  selector: 'app-consultar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './013-consultar-cliente.component.html',
  styleUrls: ['./013-consultar-cliente.component.css'],
})
export class ConsultarClienteComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly detalheClienteService = inject(DetalheClienteService);

  cpfPesquisa: string = '';
  clienteAtual: ClienteDetalhado | null = null;
  carregando = false;
  erro = '';
  foiBuscado = false;

ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const cpfDaUrl = params.get('cpf');
      if (cpfDaUrl) {
        this.cpfPesquisa = cpfDaUrl;
        setTimeout(() => {
          this.pesquisarCliente();
        }, 100);
      }
    });
  }

  apenasNumeros(): void {
    this.cpfPesquisa = this.cpfPesquisa.replace(/\D/g, '');
  }

  validarCpf(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      return false;
    }

    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
      resto = 0;
    }

    if (resto !== parseInt(cpfLimpo.substring(9, 10))) {
      return false;
    }

    soma = 0;

    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
      resto = 0;
    }

    return resto === parseInt(cpfLimpo.substring(10, 11));
  }

  private carregarClienteDoServidor(): void {
    const cpfLimpo = this.cpfPesquisa.replace(/\D/g, '');

    this.detalheClienteService.obterClienteDetalhadoPorCpf(cpfLimpo).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.clienteAtual = cliente;
        } else {
          this.clienteAtual = null;
          this.erro = 'Cliente não encontrado no banco de dados.';
        }

        this.carregando = false;
      },
      error: () => {
        this.clienteAtual = null;
        this.erro = 'Erro ao buscar dados do cliente no servidor.';
        this.carregando = false;
      },
    });
  }

  pesquisarCliente(): void {
    this.foiBuscado = true;
    this.clienteAtual = null;

    if (!this.cpfPesquisa.trim()) {
      this.erro = 'Por favor, digite um CPF válido';
      return;
    }

    if (!this.validarCpf(this.cpfPesquisa)) {
      this.erro = 'CPF inválido';
      return;
    }

    this.carregando = true;
    this.erro = '';
    this.carregarClienteDoServidor();
  }

  limparPesquisa(): void {
    this.cpfPesquisa = '';
    this.clienteAtual = null;
    this.erro = '';
    this.foiBuscado = false;
  }
}
