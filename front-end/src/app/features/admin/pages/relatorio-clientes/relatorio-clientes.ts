import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

// Interface para tipar os dados da nossa tabela
export interface RelatorioCliente {
  cpfCliente: string;
  nomeCliente: string;
  emailCliente: string;
  salario: number;
  numeroConta: string;
  saldo: number;
  limite: number;
  cpfGerente: string;
  nomeGerente: string;
}

@Component({
  selector: 'app-relatorio-clientes',
  standalone: true,
  imports: [
    CommonModule,
    MatSortModule,
    MatTableModule
  ],
  templateUrl: './relatorio-clientes.html',
  styleUrl: './relatorio-clientes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatorioClientesComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);

  @ViewChild(MatSort) private ordenador!: MatSort;

  // As 9 colunas exigidas pelo protótipo
  readonly colunasExibidas = [
    'cpfCliente', 'nomeCliente', 'emailCliente', 'salario', 
    'numeroConta', 'saldo', 'limite', 'cpfGerente', 'nomeGerente'
  ];
  
  // Controle de estado da tela usando Signals
  readonly carregando = signal(true);
  readonly mensagemErro = signal('');
  readonly fonteDados = new MatTableDataSource<RelatorioCliente>([]);

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  ngAfterViewInit(): void {
    this.fonteDados.sort = this.ordenador;
  }

  // Reaproveitado a máscara de CPF
  formatarCpf(cpf: string): string {
    if (!cpf || cpf === '-') return '-';
    const cpfNormalizado = cpf.replace(/\D/g, '');
    if (cpfNormalizado.length !== 11) return cpf;
    return cpfNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private carregarRelatorio(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    // Dispara as 3 requisições ao mesmo tempo
    forkJoin({
      clientes: this.http.get<any[]>('http://localhost:3000/clientes'),
      contas: this.http.get<any[]>('http://localhost:3000/contas'),
      gerentes: this.http.get<any[]>('http://localhost:3000/gerentes')
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        // JOIN MANUAL exigido pela R16
        const dadosMapeados = res.clientes.map(cliente => {
          // Busca a conta que pertence a este cliente
          const conta = res.contas.find(c => c.holderDocument === cliente.cpf);
          
          return {
            cpfCliente: cliente.cpf,
            nomeCliente: cliente.nome,
            emailCliente: cliente.email,
            salario: cliente.salario || 0,
            numeroConta: conta ? conta.accountNumber : '-',
            saldo: conta ? conta.availableBalance : 0,
            limite: conta ? conta.limit : 0,
            cpfGerente: conta && conta.managerDocument ? conta.managerDocument : '-',
            nomeGerente: conta && conta.manager ? conta.manager : '-'
          };
        });

        // Ordena a lista pelo nome do cliente em ordem alfabética
        dadosMapeados.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente));

        this.fonteDados.data = dadosMapeados;
        this.carregando.set(false);
      },
      error: () => {
        this.mensagemErro.set('Não foi possível carregar os dados do relatório.');
        this.carregando.set(false);
      }
    });
  }
}