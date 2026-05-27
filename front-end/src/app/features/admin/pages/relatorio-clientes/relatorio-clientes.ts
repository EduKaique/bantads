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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { ConsultasGerenciaisService } from '../../../../core/services/consultas-gerenciais.service';
import { RelatorioCliente } from '../../../../shared/models/consultas-gerenciais';

@Component({
  selector: 'app-relatorio-clientes',
  standalone: true,
  imports: [CommonModule, MatSortModule, MatTableModule],
  templateUrl: './relatorio-clientes.html',
  styleUrl: './relatorio-clientes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatorioClientesComponent implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultasGerenciaisService = inject(ConsultasGerenciaisService);

  @ViewChild(MatSort) private ordenador!: MatSort;

  readonly colunasExibidas = [
    'cpfCliente',
    'nomeCliente',
    'emailCliente',
    'salario',
    'numeroConta',
    'saldo',
    'limite',
    'cpfGerente',
    'nomeGerente',
  ];

  readonly carregando = signal(true);
  readonly mensagemErro = signal('');
  readonly fonteDados = new MatTableDataSource<RelatorioCliente>([]);

  ngOnInit(): void {
    this.carregarRelatorio();
  }

  ngAfterViewInit(): void {
    this.fonteDados.sort = this.ordenador;
  }

  formatarCpf(cpf: string): string {
    if (!cpf || cpf === '-') return '-';

    const cpfNormalizado = cpf.replace(/\D/g, '');

    if (cpfNormalizado.length !== 11) return cpf;

    return cpfNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private carregarRelatorio(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.consultasGerenciaisService
      .listarRelatorioClientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dadosMapeados) => {
          this.fonteDados.data = dadosMapeados;
          this.carregando.set(false);
        },
        error: () => {
          this.mensagemErro.set('Nao foi possivel carregar os dados do relatorio.');
          this.carregando.set(false);
        },
      });
  }
}
