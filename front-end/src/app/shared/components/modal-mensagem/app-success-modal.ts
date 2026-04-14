import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-modal',
  templateUrl: './app-success-modal.html',
  styleUrls: ['./app-success-modal.css'],
  imports: []
})
export class AppSuccessModalComponent {
  @Input() mostrar: boolean = false;
  @Input() titulo: string = 'Operação realizada com sucesso!';
  @Input() subtitulo: string = '';
  @Input() textoBotao: string = 'Voltar para Página Inicial';
  @Input() rotaDestino: string | any[] = '/';
  @Input() mostrarDataHora: boolean = false;
  @Input() dadosAdicionais: string[] = [];
  @Input() dataHoraReferencia?: string | Date;
  @Input() exibirBotaoSecundario = false;
  @Input() textoBotaoSecundario = '';

  @Output() mostrarChange = new EventEmitter<boolean>();
  @Output() botaoSecundarioClick = new EventEmitter<void>();

  get dataHoraFormatada(): string {
    const dataAtual = this.dataHoraReferencia
      ? new Date(this.dataHoraReferencia)
      : new Date();
    const data = dataAtual.toLocaleDateString('pt-BR');
    const hora = dataAtual.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Data: ${data} | Hora: ${hora}`;
  }

  constructor(private router: Router) {}

  fecharModal(): void {
    this.mostrar = false;
    this.mostrarChange.emit(this.mostrar);

    if (this.rotaDestino) {
      if (typeof this.rotaDestino === 'string') {
        this.router.navigate([this.rotaDestino]);
      } else {
        this.router.navigate(this.rotaDestino);
      }
    }
  }

  acionarBotaoSecundario(): void {
    this.mostrar = false;
    this.mostrarChange.emit(this.mostrar);
    this.botaoSecundarioClick.emit();
  }
}
