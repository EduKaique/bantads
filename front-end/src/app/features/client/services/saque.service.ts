import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ContaService } from '../../../core/services/conta.service';

export interface SaqueRequest {
  contaOrigem: string;
  valor: number;
}

export interface SaqueResponse {
  message: string;
  novoSaldoOrigem: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaqueService {
  private readonly contaService = inject(ContaService);

  realizarSaque(request: SaqueRequest): Observable<SaqueResponse> {
    return this.contaService.sacar(request.contaOrigem, request.valor).pipe(
      map((resposta) => ({
        message: 'Saque realizado com sucesso!',
        novoSaldoOrigem: resposta.saldo,
      })),
    );
  }
}
