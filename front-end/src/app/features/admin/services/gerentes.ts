import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_URL } from '../../../core/configs/api.token';
import { Gerente } from '../../../shared/models/gerente';

interface GerenteResposta {
  cpf: string;
  nome: string;
  email: string;
  celular: string;
}

@Injectable({
  providedIn: 'root',
})
export class GerentesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  listar(): Observable<Gerente[]> {
    return this.http
      .get<GerenteResposta[]>(`${this.apiUrl}/admin/gerentes`)
      .pipe(
        map((gerentes) =>
          gerentes
            .map((gerente) => this.mapearGerente(gerente))
            .sort((gerenteA, gerenteB) =>
              gerenteA.nome.localeCompare(gerenteB.nome, 'pt-BR'),
            ),
        ),
      );
  }

  private mapearGerente(gerenteResposta: GerenteResposta): Gerente {
    return {
      cpf: gerenteResposta.cpf,
      nome: gerenteResposta.nome,
      email: gerenteResposta.email,
      celular: gerenteResposta.celular,
    };
  }

  inserir(dadosGerente: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/gerentes`, dadosGerente);
  }

  atualizar(cpf: string, dadosGerente: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/atualizaPerfil/${cpf}`, dadosGerente);
  }
  
  remover(cpf: string) {
    return this.http.delete<any>(`${this.apiUrl}/admin/gerentes/${cpf}`);
  }
}
