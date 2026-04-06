import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PedidoAutocadastro } from '../../../../shared/models/pedido-autocadastro';
import { formatCpf, formatDateBR } from '../../../../shared/utils/formatters';

@Component({
  selector: 'app-card-pedido-autocadastro',
  imports: [CommonModule],
  templateUrl: './card-pedido-autocadastro.html',
  styleUrl: './card-pedido-autocadastro.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPedidoAutocadastroComponent {
  @Input({ required: true }) pedidoAutocadastro!: PedidoAutocadastro;

  @Output() aprovar = new EventEmitter<PedidoAutocadastro>();
  @Output() rejeitar = new EventEmitter<PedidoAutocadastro>();

  readonly formatCpf = formatCpf;
  readonly formatDateBR = formatDateBR;

  emitirAprovacao(): void {
    this.aprovar.emit(this.pedidoAutocadastro);
  }

  emitirRejeicao(): void {
    this.rejeitar.emit(this.pedidoAutocadastro);
  }
}