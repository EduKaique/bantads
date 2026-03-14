import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Client } from '../../../shared/models/client';
import { API_URL } from '../../../core/configs/api.token';

interface UpdateUserResponseApi {
  user: Client;
  balance: number;
  managerName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  buscaPerfil(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/client/perfil/${id}`);
  }

  atualizaUsuario(client: Client): Observable<UpdateUserResponseApi> {
    return this.http.put<UpdateUserResponseApi>(
      `${this.apiUrl}/client/atualizaPerfil/${client.id}`,
      client
    );
  }

}