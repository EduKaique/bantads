import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Client } from '../../../shared/models/client';
import { API_URL } from '../../../core/configs/api.token';

interface UpdateUserResponseApi {
  balance: number;
  managerName: string;
  cliente?: any;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  buscaPerfil(cpf: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clientes/${cpf}`);
  }

  atualizaUsuario(cpf: string, data: any): Observable<UpdateUserResponseApi> {
    return this.http.put<UpdateUserResponseApi>(
      `${this.apiUrl}/clientes/${cpf}`,
      data
    );
  }

  buscaDadosConta(cpf: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contas/cpf/${cpf}`);
  }

}
