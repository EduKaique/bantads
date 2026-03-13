import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

export interface Cliente {
  id: string;
  cpf: string;
  nome: string;
  cidade: string;
  estado: string;
  saldo: number;
  limite: number;
}

@Component({
  selector: 'app-consultar-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './consultar-clientes.html',
  styleUrls: ['./consultar-clientes.css']
})
export class ConsultarClientesComponent implements OnInit {
  
  tipoFiltro: 'nome' | 'cpf' = 'nome';
  termoBusca: string = '';

  // Configurações de Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 5;
  clientesPaginados: Cliente[] = [];

  // Dados de exemplo
  clientes: Cliente[] = [
    { id: '1', cpf: '111.111.111-11', nome: 'Gabriel de Paula Brasil', cidade: 'Curitiba', estado: 'Paraná', saldo: 1500.50, limite: 5000 },
    { id: '2', cpf: '222.222.222-22', nome: 'Amanda Silva', cidade: 'São Paulo', estado: 'São Paulo', saldo: 250.00, limite: 1000 },
    { id: '3', cpf: '333.333.333-33', nome: 'Carlos Eduardo', cidade: 'Pinhais', estado: 'Paraná', saldo: 8500.00, limite: 15000 },
    { id: '4', cpf: '444.444.444-44', nome: 'Beatriz Costa', cidade: 'Colombo', estado: 'Paraná', saldo: 120.00, limite: 500 },
    { id: '5', cpf: '555.555.555-55', nome: 'Daniel Souza', cidade: 'Londrina', estado: 'Paraná', saldo: 3000.00, limite: 6000 },
    { id: '6', cpf: '666.666.666-66', nome: 'Eduarda Lima', cidade: 'Maringá', estado: 'Paraná', saldo: 450.00, limite: 1500 }
  ];

  clientesExibidos: Cliente[] = [];

  ngOnInit(): void {
    this.ordenarClientesPorNome();
    this.clientesExibidos = [...this.clientes];
    this.atualizarPaginacao();
  }

  get totalPaginas(): number {
    return Math.ceil(this.clientesExibidos.length / this.itensPorPagina);
  }

  ordenarClientesPorNome(): void {
    this.clientes.sort((a, b) => a.nome.localeCompare(b.nome));
  }

  filtrarClientes(): void {
    if (!this.termoBusca.trim()) {
      this.clientesExibidos = [...this.clientes];
    } else {
      const termo = this.termoBusca.toLowerCase().trim();

      this.clientesExibidos = this.clientes.filter(cliente => {
        if (this.tipoFiltro === 'nome') {
          return cliente.nome.toLowerCase().includes(termo);
        } else {
          const cpfLimpo = cliente.cpf.replace(/\D/g, '');
          const termoLimpo = termo.replace(/\D/g, '');
          return cpfLimpo.includes(termoLimpo) || cliente.cpf.includes(termo);
        }
      });
    }
    
    // Sempre que filtrar, volta para a primeira página
    this.paginaAtual = 1;
    this.atualizarPaginacao();
  }

  // --- LÓGICA DE PAGINAÇÃO ---
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
      valor = valor.replace(/\D/g, ''); // Remove tudo que não for número

      if (valor.length > 11) valor = valor.slice(0, 11);
      if (valor.length > 9) valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      else if (valor.length > 6) valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
      else if (valor.length > 3) valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
      
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