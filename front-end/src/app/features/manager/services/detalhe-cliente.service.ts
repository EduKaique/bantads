import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ConsultasGerenciaisService } from '../../../core/services/consultas-gerenciais.service';
import { ClienteDetalhado } from '../../../shared/models/consultas-gerenciais';

export type { ClienteDetalhado } from '../../../shared/models/consultas-gerenciais';

@Injectable({
  providedIn: 'root',
})
export class DetalheClienteService {
  private readonly consultasGerenciaisService = inject(ConsultasGerenciaisService);

  obterClienteDetalhadoPorCpf(cpf: string): Observable<ClienteDetalhado | null> {
    return this.consultasGerenciaisService.obterClienteDetalhadoPorCpf(cpf);
  }
}
