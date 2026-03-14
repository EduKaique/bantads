import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { PedidoAutocadastro } from '../../../shared/models/pedido-autocadastro';

interface PedidoAutocadastroResposta {
  cpf: string;
  nome: string;
  salario: number;
  dataSolicitacao: string;
}

@Injectable({
  providedIn: 'root',
})
export class PedidosAutocadastroService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listar(): Observable<PedidoAutocadastro[]> {
    return this.http
      .get<PedidoAutocadastroResposta[]>(`${this.apiUrl}/manager/pedidos-autocadastro`)
      .pipe(
        map((resposta) =>
          resposta
            .map((pedidoAutocadastro) => this.mapearPedidoAutocadastro(pedidoAutocadastro))
            .sort((pedidoAtual, proximoPedido) => this.ordenarPorDataDesc(pedidoAtual, proximoPedido)),
        ),
      );
  }

  private mapearPedidoAutocadastro(
    pedidoAutocadastroResposta: PedidoAutocadastroResposta,
  ): PedidoAutocadastro {
    return {
      cpf: pedidoAutocadastroResposta.cpf,
      nome: pedidoAutocadastroResposta.nome,
      salario: pedidoAutocadastroResposta.salario,
      dataSolicitacao: pedidoAutocadastroResposta.dataSolicitacao,
    };
  }

  private ordenarPorDataDesc(
    pedidoAtual: PedidoAutocadastro,
    proximoPedido: PedidoAutocadastro,
  ): number {
    return (
      new Date(proximoPedido.dataSolicitacao).getTime() -
      new Date(pedidoAtual.dataSolicitacao).getTime()
    );
  }

  rejeitar(cpf: string, motivo: string): Observable<boolean> {
    console.log(`Rejeitando CPF: ${cpf} pelo motivo: ${motivo}`);
    return of(true).pipe(delay(500));
  }
}
