import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ClienteInfo {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
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
  cpfPesquisa: string = '';
  clienteAtual: ClienteInfo | null = null;
  carregando: boolean = false;
  erro: string = '';
  foiBuscado: boolean = false;

  ngOnInit(): void {

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

  private carregarClienteExemplo(): void {

    this.clienteAtual = {
      nome: 'Diddy, o Peixe',
      cpf: '11044108980',
      email: 'diddy@gmail.com',
      telefone: '(41) 98729-0808',
      endereco: 'Rua das Flores, 123, Bloco B, Apt 101\nBairro Centro\nCuritiba - PR\n80000-000',
      salario: 'R$ 1.300,00',
      saldo: 'R$ 2.304,00',
      limite: 'R$ 1.000,00',
    };
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


    setTimeout(() => {
      this.carregarClienteExemplo();
      this.carregando = false;
    }, 500);
  }

  limparPesquisa(): void {
    this.cpfPesquisa = '';
    this.clienteAtual = null;
    this.erro = '';
    this.foiBuscado = false;
  }
}
