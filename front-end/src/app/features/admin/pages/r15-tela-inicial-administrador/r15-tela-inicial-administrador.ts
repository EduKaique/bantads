import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GerentesDashboardService } from '../../services/gerentes-dashboard';
import { CardGerenteDashboardComponent } from '../../components/card-gerente-dashboard/card-gerente-dashboard';
import { GerenteDashboard } from '../../../../shared/models/gerente-dashboard';
import { DashboardEstatisticas } from '../../../../shared/models/dashboard-estatisticas';

interface FiltroOpcao {
  id: string;
  label: string;
  selecionado: boolean;
}

@Component({
  selector: 'app-r15-tela-inicial-administrador',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardGerenteDashboardComponent,
  ],
  templateUrl: './r15-tela-inicial-administrador.html',
  styleUrl: './r15-tela-inicial-administrador.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class R15TelaInicialAdministrador implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gerentesDashboardService = inject(GerentesDashboardService);

  readonly estatisticas = signal<DashboardEstatisticas | null>(null);
  readonly gerentes = signal<GerenteDashboard[]>([]);
  readonly carregando = signal(true);
  readonly mensagemErro = signal('');

  readonly filtros = signal<FiltroOpcao[]>([
    { id: 'positivos', label: 'Gerentes Positivos', selecionado: true },
    { id: 'negativos', label: 'Gerentes Negativos', selecionado: true },
    { id: 'comClientes', label: 'Com Clientes', selecionado: true },
    { id: 'semClientes', label: 'Sem Clientes', selecionado: true },
  ]);

  readonly todosFiltroosSelecionados = signal(true);

  readonly formularioFiltro = this.formBuilder.nonNullable.group({
    pesquisa: [''],
  });

  ngOnInit(): void {
    this.carregarDados();
  }

  get gerentesFiltrados(): GerenteDashboard[] {
    const pesquisa = this.formularioFiltro.controls.pesquisa.value
      .toLowerCase()
      .trim();
    
    let gerentesFiltrados = this.gerentes();

    const filtrosPorId = this.filtros().reduce(
      (acc, filtro) => {
        acc[filtro.id] = filtro.selecionado;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    gerentesFiltrados = gerentesFiltrados.filter((gerente) => {
      const ehPositivo = gerente.totalSaldoNegativo <= gerente.totalSaldoPositivo;
      const ehNegativo = gerente.totalSaldoNegativo > gerente.totalSaldoPositivo;
      const temClientes = gerente.totalClientes > 0;

      const passouFiltros =
        (ehPositivo && filtrosPorId['positivos']) ||
        (ehNegativo && filtrosPorId['negativos']) ||
        (temClientes && filtrosPorId['comClientes']) ||
        (!temClientes && filtrosPorId['semClientes']);

      return passouFiltros;
    });

    if (!pesquisa) {
      return gerentesFiltrados;
    }

    return gerentesFiltrados.filter(
      (gerente) =>
        gerente.nome.toLowerCase().includes(pesquisa) ||
        gerente.email.toLowerCase().includes(pesquisa) ||
        gerente.cpf.includes(pesquisa),
    );
  }

  alternadorFiltro(id: string): void {
    const filtrosAtuais = this.filtros();
    const filtroIndex = filtrosAtuais.findIndex((f) => f.id === id);

    if (filtroIndex > -1) {
      filtrosAtuais[filtroIndex].selecionado =
        !filtrosAtuais[filtroIndex].selecionado;
      this.filtros.set([...filtrosAtuais]);
      this.atualizarTodosFiltrosSelecionados();
    }
  }

  selecionarTodosFiltros(): void {
    const filtrosAtuais = this.filtros();
    const todosMarquedos = filtrosAtuais.every((f) => f.selecionado);

    this.filtros.set(
      filtrosAtuais.map((f) => ({
        ...f,
        selecionado: !todosMarquedos,
      })),
    );
    this.atualizarTodosFiltrosSelecionados();
  }

  private atualizarTodosFiltrosSelecionados(): void {
    const todos = this.filtros().every((f) => f.selecionado);
    this.todosFiltroosSelecionados.set(todos);
  }

  rastrearPorCpf(_: number, gerente: GerenteDashboard): string {
    return gerente.cpf;
  }

  private carregarDados(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.gerentesDashboardService
      .obterEstatisticas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (estatisticas) => {
          this.estatisticas.set(estatisticas);
        },
        error: () => {
          this.mensagemErro.set(
            'Erro ao carregar estatísticas do dashboard',
          );
        },
      });

    this.gerentesDashboardService
      .obterGerentesComDados()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (gerentes) => {
          this.gerentes.set(gerentes);
          this.carregando.set(false);
        },
        error: () => {
          this.mensagemErro.set('Erro ao carregar gerentes');
          this.carregando.set(false);
        },
      });
  }
}
