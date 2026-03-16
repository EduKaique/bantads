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
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { PedidoAutocadastro } from '../../../../shared/models/pedido-autocadastro';
import { CardPedidoAutocadastroComponent } from '../../components/card-pedido-autocadastro/card-pedido-autocadastro';
import { PedidosAutocadastroService } from '../../services/pedidos-autocadastro';
import { ModalRejeitarPedidoComponent } from '../../components/card-pedido-autocadastro/modal-rejeitar-pedido/modal-rejeitar-pedido.component';
import { ModalAprovarPedidoComponent } from '../../components/card-pedido-autocadastro/modal-aprovar-pedido/modal-aprovar-pedido';

@Component({
  selector: 'app-tela-inicial-gerente',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPrimaryComponent,
    CardPedidoAutocadastroComponent,
    ModalRejeitarPedidoComponent,
    ModalAprovarPedidoComponent
  ],
  templateUrl: './tela-inicial-gerente.html',
  styleUrl: './tela-inicial-gerente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelaInicialGerenteComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly pedidosAutocadastroService = inject(PedidosAutocadastroService);

  readonly formularioFiltro = this.formBuilder.nonNullable.group({
    cpf: [''],
  });

  readonly pedidosAutocadastro = signal<PedidoAutocadastro[]>([]);
  readonly carregando = signal(true);
  readonly mensagemErro = signal('');
  readonly pedidoSelecionadoParaRejeicao = signal<PedidoAutocadastro | null>(null);
  readonly pedidoSelecionadoParaAprovacao = signal<PedidoAutocadastro | null>(null);

  ngOnInit(): void {
    this.carregarPedidosAutocadastro();
  }

  get pedidosFiltrados(): PedidoAutocadastro[] {
    const cpfFiltrado = this.normalizarCpf(this.formularioFiltro.controls.cpf.value);

    if (!cpfFiltrado) {
      return this.pedidosAutocadastro();
    }

    return this.pedidosAutocadastro().filter((pedido) =>
      this.normalizarCpf(pedido.cpf).includes(cpfFiltrado),
    );
  }

  rastrearPorCpf(_: number, pedido: PedidoAutocadastro): string {
    return `${pedido.cpf}-${pedido.dataSolicitacao}`;
  }

  private carregarPedidosAutocadastro(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.pedidosAutocadastroService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pedidos) => {
          this.pedidosAutocadastro.set(pedidos);
          this.carregando.set(false);
        },
        error: () => {
          this.mensagemErro.set('Não foi possível carregar os pedidos de autocadastro.');
          this.carregando.set(false);
        },
      });
  }

  private normalizarCpf(valor: string): string {
    return valor.replace(/\D/g, '');
  }

  abrirModalRejeicao(pedido: PedidoAutocadastro): void {
    this.pedidoSelecionadoParaRejeicao.set(pedido);
  }

  abrirModalAprovacao(pedido: PedidoAutocadastro): void {
    this.pedidoSelecionadoParaAprovacao.set(pedido);
  }

  fecharModal(): void {
    this.pedidoSelecionadoParaRejeicao.set(null);
    this.pedidoSelecionadoParaAprovacao.set(null);
  }

  processarRejeicao(evento: { pedido: PedidoAutocadastro; motivo: string }): void {
    this.carregando.set(true);
    this.pedidosAutocadastroService
      .rejeitar(evento.pedido.cpf, evento.motivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const listaAtualizada = this.pedidosAutocadastro().filter(p => p.cpf !== evento.pedido.cpf);
          this.pedidosAutocadastro.set(listaAtualizada);
          this.fecharModal();
          this.carregando.set(false);
        },
        error: () => {
          this.mensagemErro.set('Erro ao rejeitar.');
          this.carregando.set(false);
        }
      });
  }

  processarAprovacao(evento: { pedido: PedidoAutocadastro }): void {
    this.carregando.set(true);
    this.pedidosAutocadastroService
      .aprovar(evento.pedido.cpf)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clienteCriado) => {
          const listaAtualizada = this.pedidosAutocadastro().filter(p => p.cpf !== evento.pedido.cpf);
          this.pedidosAutocadastro.set(listaAtualizada);
          this.fecharModal();
          this.carregando.set(false);
        },
        error: () => {
          this.mensagemErro.set('Erro ao aprovar.');
          this.carregando.set(false);
        }
    });
  }
}