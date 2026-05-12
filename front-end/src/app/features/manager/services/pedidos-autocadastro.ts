import { inject, Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { PedidoAutocadastro } from '../../../shared/models/pedido-autocadastro';
import { Client } from '../../../shared/models/client';

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

  listar(cpfGerente: string): Observable<PedidoAutocadastro[]> {
    const params = new HttpParams()
      .set('filtro', 'para_aprovar')
      .set('cpfGerente', cpfGerente);

    return this.http
      .get<PedidoAutocadastroResposta[]>(`${this.apiUrl}/clientes`, { params })
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

  rejeitar(cpf: string, motivo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes/${cpf}/rejeitar`, { motivo });
  }

  aprovar(cpf: string) {
    return this.http.post<Client>(`${this.apiUrl}/clientes/${cpf}/aprovar`, {});
  }
}
