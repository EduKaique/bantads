import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Client } from '../../../shared/models/client';
import { API_URL } from '../../../core/configs/api.token';

interface UpdateUserResponseApi {
  balance: number;
  managerName: string;
  cliente?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  buscaPerfil(cpf: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/cliente/perfil/${cpf}`);
  }

  atualizaUsuario(cpf: string, data: any): Observable<UpdateUserResponseApi> {
    return this.http.put<UpdateUserResponseApi>(
      `${this.apiUrl}/cliente/atualizaPerfil/${cpf}`,
      data
    );
  }

}
