import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidoAutocadastro } from '../../../../../shared/models/pedido-autocadastro';
@Component({
  selector: 'app-modal-rejeitar-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-rejeitar-pedido.component.html',
  styleUrl: './modal-rejeitar-pedido.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalRejeitarPedidoComponent {
  @Input({ required: true }) pedido!: PedidoAutocadastro;
  @Output() fechar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<{ pedido: PedidoAutocadastro; motivo: string }>();

  motivoControl = new FormControl('', { 
    nonNullable: true, 
    validators: [Validators.required, Validators.minLength(10)] 
  });

  emitirFechamento(): void {
    this.fechar.emit();
  }

  emitirConfirmacao(): void {
    if (this.motivoControl.valid) {
      this.confirmar.emit({ pedido: this.pedido, motivo: this.motivoControl.value });
    } else {
      this.motivoControl.markAsTouched();
    }
  }
}