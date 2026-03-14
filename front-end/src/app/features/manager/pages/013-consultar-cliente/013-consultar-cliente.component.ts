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

  ngOnInit(): void {
    // Página começa vazia por padrão
  }

  private carregarClienteExemplo(): void {
    // Dados mocados para desenvolvimento
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
    if (!this.cpfPesquisa.trim()) {
      this.erro = 'Por favor, digite um CPF válido';
      return;
    }

    this.carregando = true;
    this.erro = '';

    // TODO: Integrar com serviço de cliente futuramente
    // this.clienteService.obterClientePorCpf(this.cpfPesquisa).subscribe({
    //   next: (cliente) => {
    //     this.clienteAtual = cliente;
    //     this.carregando = false;
    //   },
    //   error: (erro) => {
    //     this.erro = 'Cliente não encontrado';
    //     this.clienteAtual = null;
    //     this.carregando = false;
    //   }
    // });

    // Simulação apenas para dev - remover quando integrar com API
    setTimeout(() => {
      this.carregarClienteExemplo();
      this.carregando = false;
    }, 500);
  }

  limparPesquisa(): void {
    this.cpfPesquisa = '';
    this.clienteAtual = null;
    this.erro = '';
  }
}
