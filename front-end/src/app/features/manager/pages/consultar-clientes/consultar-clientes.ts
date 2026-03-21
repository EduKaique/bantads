import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface Cliente {
  id: string;
  cpf: string;
  nome: string;
  cidade: string;
  estado: string;
  saldo: number;
  limite: number;
  numeroConta?: string;
}

@Component({
  selector: 'app-consultar-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
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

  clientes: Cliente[] = [];
  clientesExibidos: Cliente[] = [];
  carregando: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarClientesDaAPI();
  }

  carregarClientesDaAPI(): void {
    this.carregando = true;
    
    this.http.get<Cliente[]>('http://localhost:3000/manager/clientes').subscribe({
      next: (dados) => {
        this.clientes = dados;
        this.ordenarClientesPorNome();
        this.clientesExibidos = [...this.clientes];
        this.atualizarPaginacao();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar clientes da API:', erro);
        this.carregando = false;
      }
    });
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