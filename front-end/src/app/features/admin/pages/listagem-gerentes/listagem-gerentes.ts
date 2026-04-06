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
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { Gerente } from '../../../../shared/models/gerente';
import { GerentesService } from '../../services/gerentes';
import { ModalInserirGerenteComponent } from '../../components/modal-inserir-gerente/modal-inserir-gerente';
import { ModalAtualizarGerente } from '../../components/modal-atualizar-gerente/modal-atualizar-gerente';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { MatDialog } from '@angular/material/dialog';
import { WarningDialogComponent } from '../../../../shared/components/warning-dialog/warning-dialog.component';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-listagem-gerentes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSortModule,
    MatTableModule,
    InputPrimaryComponent,
    ModalInserirGerenteComponent,
    ModalAtualizarGerente,
    AppSuccessModalComponent,
    MatIcon
],
  templateUrl: './listagem-gerentes.html',
  styleUrl: './listagem-gerentes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListagemGerentesComponent implements OnInit, AfterViewInit {
  showModal = false;
  tituloModalSucesso = 'Operação realizada com sucesso!';
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gerentesService = inject(GerentesService);
  private readonly dialog = inject(MatDialog);
  private readonly activatedRoute = inject(ActivatedRoute);

  @ViewChild(MatSort) private ordenador!: MatSort;

  readonly colunasExibidas = ['nome', 'cpf', 'email', 'celular', 'acoes'];
  readonly formularioFiltro = this.formBuilder.nonNullable.group({
    cpf: [''],
  });
  readonly carregando = signal(true);
  readonly mensagemErro = signal('');
  readonly mostrarModalInserir = signal(false);
  readonly mostrarModalAtualizar = signal(false);
  readonly fonteDados = new MatTableDataSource<Gerente>([]);
  readonly gerenteSelecionado = signal<Gerente | null>(null);

  ngOnInit(): void {
    this.configurarFiltro();
    this.carregarGerentes();
    this.escutarParametrosEdicao();
  }

  private escutarParametrosEdicao(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const cpfParaEditar = params['editar'];
        if (cpfParaEditar) {
          const gerente = this.fonteDados.data.find((g) => g.cpf === cpfParaEditar);
          if (gerente) {
            this.abrirModalAtualizar(gerente);
          }
        }
      });
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

  abrirModalInserir(): void {
    this.mostrarModalInserir.set(true);
  }

  fecharModalInserir(): void {
    this.mostrarModalInserir.set(false);
  }

  abrirModalAtualizar(gerente: Gerente): void {
    this.gerenteSelecionado.set(gerente);
    this.mostrarModalAtualizar.set(true);
  }

  fecharModalAtualizar(): void {
    this.mostrarModalAtualizar.set(false);
  }

  processarInsercao(dados: any): void {
    this.carregando.set(true);
    this.gerentesService.inserir(dados).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.fecharModalInserir();
        this.fecharModalAtualizar();
        this.carregarGerentes();
      },
      error: () => {
        this.mensagemErro.set('Erro ao cadastrar gerente.');
        this.carregando.set(false);
      }
    });
  }

  processarAtualizacao(dados: any): void {
    const gerente = this.gerenteSelecionado();

    if (!gerente) return;

    this.carregando.set(true);

    this.gerentesService
      .atualizar(gerente.cpf, dados)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.fecharModalAtualizar();
          this.carregarGerentes();
          this.tituloModalSucesso = 'Gerente atualizado com sucesso!';
          this.showModal = true;
        },
        error: () => {
          this.mensagemErro.set('Erro ao atualizar gerente.');
          this.carregando.set(false);
      }
    });
  }

  processarRemocao(gerente: Gerente): void {
    const dialogRef = this.dialog.open(WarningDialogComponent, {
      width: '400px',
      data: {
        title: 'Excluir Gerente',
        message: `Tem certeza que deseja remover o gerente ${gerente.nome}? Esta ação transferirá as contas dele para outro gerente.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      
      if (confirmado) {
        this.carregando.set(true);
        
        this.gerentesService.remover(gerente.cpf)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (resposta) => {
              this.carregarGerentes(); 
              this.tituloModalSucesso = resposta.message || 'Gerente removido com sucesso!'; 
              this.showModal = true;
            },
            error: (erro) => {
              this.mensagemErro.set(erro.error?.message || 'Erro ao remover o gerente.');
              this.carregando.set(false);
            }
          });
      }
    });
  }
}
