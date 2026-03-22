import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClienteDetailService, ClienteDetalhado } from '../../services/cliente-detail.service';

interface ClienteInfo {
  nome: string;
  cpf: string;
  email: string;
  celular: string;
  endereco: string;
  salario: string;
  saldo: string;
  limite: string;
}

@Component({
  selector: 'app-consultar-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './013-consultar-cliente.component.html',
  styleUrls: ['./013-consultar-cliente.component.css'],
})
export class ConsultarClienteComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private clienteDetailService = inject(ClienteDetailService);

  cpfPesquisa: string = '';
  clienteAtual: ClienteInfo | null = null;
  carregando: boolean = false;
  erro: string = '';
  foiBuscado: boolean = false;

  ngOnInit(): void {
    // Verifica se há CPF nos query params
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['cpf']) {
        this.cpfPesquisa = params['cpf'];
        // Aguarda um pouco para garantir que a UI foi atualizada
        setTimeout(() => {
          this.pesquisarCliente();
        }, 100);
      }
    });
  }

  apenasNumeros(): void {
    this.cpfPesquisa = this.cpfPesquisa.replace(/\D/g, '');
  }

  validarCPF(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return false;
    }

    // Verifica se não é uma sequência repetida
    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return false;
    }

    // Valida primeiro dígito verificador
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

    // Valida segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
      resto = 0;
    }
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) {
      return false;
    }

    return true;
  }

  private carregarClienteDoServidor(): void {
    const cpfLimpo = this.cpfPesquisa.replace(/\D/g, '');
    
    this.clienteDetailService.getClienteDetailByCpf(cpfLimpo).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.clienteAtual = cliente;
        } else {
          this.erro = 'Cliente não encontrado no banco de dados.';
        }
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao buscar dados do cliente no servidor.';
        this.carregando = false;
      }
    });
  }

  pesquisarCliente(): void {
    this.foiBuscado = true;

    if (!this.cpfPesquisa.trim()) {
      this.erro = 'Por favor, digite um CPF válido';
      return;
    }

    if (!this.validarCPF(this.cpfPesquisa)) {
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
