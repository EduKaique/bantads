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

@Component({
  selector: 'app-tela-inicial-gerente',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPrimaryComponent,
    CardPedidoAutocadastroComponent,
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
}
