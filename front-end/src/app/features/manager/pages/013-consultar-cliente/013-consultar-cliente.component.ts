import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DetalheClienteService, ClienteDetalhado } from '../../services/detalhe-cliente.service';
import { formatCpf, formatPhone, formatCep } from '../../../../shared/utils/formatters';
import { AuthService } from '../../../../core/auth/services/auth.service';

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
  private readonly authService = inject(AuthService);

  cpfPesquisa: string = '';
  clienteAtual: ClienteDetalhado | null = null;

  carregando = false;
  erro = '';
  foiBuscado = false;

  formatCpf = formatCpf;
  formatPhone = formatPhone;
  formatCep = formatCep;

  isSaldoNegativo(saldo: any): boolean {
    const saldoNumerico = typeof saldo === 'string' ? parseFloat(saldo) : saldo;
    return saldoNumerico < 0;
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const cpfDaUrl = params.get('cpf');
      if (cpfDaUrl) {
        this.cpfPesquisa = cpfDaUrl;
        this.pesquisarCliente();
      }
    });
  }

  aplicarMascaraCpf(valor: string): void {
    this.cpfPesquisa = this.formatCpf(valor);
  }

  validarCpf(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

    let soma = 0;
    let resto = 0;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i), 10) * (12 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpfLimpo.substring(10, 11), 10);
  }

  private carregarClienteDoServidor(): void {
    const cpfLimpo = this.cpfPesquisa.replace(/\D/g, '');

    // Validação adicional antes de fazer a requisição
    if (!cpfLimpo || cpfLimpo.length !== 11) {
      this.erro = 'CPF inválido para busca';
      this.carregando = false;
      return;
    }

    this.detalheClienteService.obterClienteDetalhadoPorCpf(cpfLimpo).subscribe({
      next: (cliente) => {
        if (cliente) {
          const gerenteLogado = this.authService.currentUserValue;
          const cpfGerenteLogado = gerenteLogado?.cpf ? gerenteLogado.cpf.replace(/\D/g, '') : '';
          const docGerenteConta = cliente.managerDocument ? String(cliente.managerDocument) : '';
          const managerCpfLimpo = docGerenteConta.replace(/\D/g, '');

          if (managerCpfLimpo && managerCpfLimpo !== cpfGerenteLogado) {
            this.clienteAtual = null;
            this.erro = 'Acesso Negado: Este cliente pertence a outro gerente.';
            this.carregando = false;
            return;
          }
          
          this.clienteAtual = cliente;
          this.erro = '';
        } else {
          this.clienteAtual = null;
          this.erro = 'Nenhum cliente encontrado com este CPF.';
        }
        this.carregando = false;
      },
      error: (erro) => {
        this.clienteAtual = null;
        // Verificar se é erro de conexão ou outro tipo
        const mensagemErro = erro?.status === 404 
          ? 'Cliente não encontrado.' 
          : 'Erro ao buscar dados do cliente. Verifique a conexão e tente novamente.';
        this.erro = mensagemErro;
        this.carregando = false;
      },
    });
  }

  pesquisarCliente(): void {
    this.foiBuscado = true;
    this.clienteAtual = null;

    // Validação de campo vazio
    if (!this.cpfPesquisa || !this.cpfPesquisa.trim()) {
      this.erro = 'Por favor, digite um CPF válido';
      this.carregando = false;
      return;
    }

    // Validação de CPF
    if (!this.validarCpf(this.cpfPesquisa)) {
      this.erro = 'CPF inválido. Verifique os dígitos e tente novamente.';
      this.carregando = false;
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
    this.carregando = false;
  }
}