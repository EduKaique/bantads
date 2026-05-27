import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { ConsultasGerenciaisService } from '../../../core/services/consultas-gerenciais.service';
import { InformacoesMelhorCliente } from '../../../shared/models/consultas-gerenciais';

export type { InformacoesMelhorCliente } from '../../../shared/models/consultas-gerenciais';

@Injectable({
  providedIn: 'root',
})
export class MelhoresClientesService {
  private readonly consultasGerenciaisService = inject(ConsultasGerenciaisService);
  private readonly authService = inject(AuthService);

  obter3MelhoresClientes(): Observable<InformacoesMelhorCliente[]> {
    return this.consultasGerenciaisService.listarMelhoresClientes(
      this.authService.currentUserValue?.cpf,
    );
  }
}
