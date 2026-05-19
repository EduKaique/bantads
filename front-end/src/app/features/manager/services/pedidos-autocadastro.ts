import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PedidoAutocadastro } from '../../../shared/models/pedido-autocadastro';
import { ClienteService } from '../../../core/services/cliente.service';
import {
  AprovacaoClienteResponse,
  ClienteParaAprovarResponse,
} from '../../../shared/models/cliente.models';

@Injectable({
  providedIn: 'root',
})
export class PedidosAutocadastroService {
  private readonly clienteService = inject(ClienteService);

  listar(cpfGerente: string): Observable<PedidoAutocadastro[]> {
    return this.clienteService.listarParaAprovar(cpfGerente).pipe(
      map((resposta) =>
        resposta
          .map((pedidoAutocadastro) => this.mapearPedidoAutocadastro(pedidoAutocadastro))
          .sort((pedidoAtual, proximoPedido) => this.ordenarPorDataDesc(pedidoAtual, proximoPedido)),
      ),
    );
  }

  private mapearPedidoAutocadastro(
    pedidoAutocadastroResposta: ClienteParaAprovarResponse,
  ): PedidoAutocadastro {
    return {
      cpf: pedidoAutocadastroResposta.cpf,
      nome: pedidoAutocadastroResposta.nome,
      salario: this.normalizarSalario(pedidoAutocadastroResposta.salario),
      dataSolicitacao: pedidoAutocadastroResposta.dataSolicitacao,
    };
  }

  private normalizarSalario(salario: number | string | undefined): number {
    if (typeof salario === 'number') {
      return salario;
    }

    if (!salario) {
      return 0;
    }

    const valorNormalizado = salario
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const valorNumerico = Number(valorNormalizado);
    return Number.isFinite(valorNumerico) ? valorNumerico : 0;
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

  rejeitar(cpf: string, motivo: string): Observable<void> {
    return this.clienteService.rejeitarCliente(cpf, motivo);
  }

  aprovar(cpf: string): Observable<AprovacaoClienteResponse> {
    return this.clienteService.aprovarCliente(cpf);
  }
}
