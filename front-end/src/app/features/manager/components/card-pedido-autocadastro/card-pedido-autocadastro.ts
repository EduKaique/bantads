import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PedidoAutocadastro } from '../../../../shared/models/pedido-autocadastro';

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

  private readonly formatadorData = new Intl.DateTimeFormat('pt-BR');

  formatarCpf(cpf: string): string {
    const cpfNormalizado = cpf.replace(/\D/g, '');

    if (cpfNormalizado.length !== 11) {
      return cpf;
    }

    return cpfNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarData(dataSolicitacao: string): string {
    return this.formatadorData.format(new Date(dataSolicitacao));
  }

  emitirAprovacao(): void {
    this.aprovar.emit(this.pedidoAutocadastro);
  }

  emitirRejeicao(): void {
    this.rejeitar.emit(this.pedidoAutocadastro);
  }
}
