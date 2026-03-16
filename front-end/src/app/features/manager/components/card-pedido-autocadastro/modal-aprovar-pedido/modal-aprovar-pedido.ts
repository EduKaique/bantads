import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PedidoAutocadastro } from '../../../../../shared/models/pedido-autocadastro';

@Component({
  selector: 'app-modal-aprovar-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-aprovar-pedido.html',
  styleUrl: './modal-aprovar-pedido.css',
})
export class ModalAprovarPedidoComponent {
  @Input({ required: true }) pedido!: PedidoAutocadastro;
  @Output() fechar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<{ pedido: PedidoAutocadastro }>();

  emitirFechamento(): void {
    this.fechar.emit();
  }
  emitirConfirmacao(): void {
      this.confirmar.emit({ pedido: this.pedido });
    }
}
