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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { Gerente } from '../../../../shared/models/gerente';
import { GerentesService } from '../../services/gerentes';

@Component({
  selector: 'app-listagem-gerentes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSortModule,
    MatTableModule,
    InputPrimaryComponent,
  ],
  templateUrl: './listagem-gerentes.html',
  styleUrl: './listagem-gerentes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemGerentesComponent implements OnInit, AfterViewInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gerentesService = inject(GerentesService);

  @ViewChild(MatSort) private ordenador!: MatSort;

  readonly colunasExibidas = ['nome', 'cpf', 'email', 'telefone', 'acoes'];
  readonly formularioFiltro = this.formBuilder.nonNullable.group({
    cpf: [''],
  });
  readonly carregando = signal(true);
  readonly mensagemErro = signal('');
  readonly fonteDados = new MatTableDataSource<Gerente>([]);

  ngOnInit(): void {
    this.configurarFiltro();
    this.carregarGerentes();
  }

  ngAfterViewInit(): void {
    this.fonteDados.sort = this.ordenador;
  }

  formatarCpf(cpf: string): string {
    const cpfNormalizado = this.normalizarCpf(cpf);

    if (cpfNormalizado.length !== 11) {
      return cpf;
    }

    return cpfNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private configurarFiltro(): void {
    this.fonteDados.filterPredicate = (gerente, cpfFiltrado) =>
      this.normalizarCpf(gerente.cpf).includes(cpfFiltrado);

    this.formularioFiltro.controls.cpf.valueChanges
      .pipe(
        startWith(this.formularioFiltro.controls.cpf.value),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cpf) => {
        this.fonteDados.filter = this.normalizarCpf(cpf);
      });
  }

  private carregarGerentes(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.gerentesService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (gerentes) => {
          this.fonteDados.data = gerentes;
          this.carregando.set(false);
        },
        error: () => {
          this.mensagemErro.set('Não foi possível carregar a lista de gerentes.');
          this.carregando.set(false);
        },
      });
  }

  private normalizarCpf(valor: string): string {
    return valor.replace(/\D/g, '');
  }
}
