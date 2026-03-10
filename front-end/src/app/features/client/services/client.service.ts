import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client } from '../../../shared/models/client';
import { Estado } from '../../../shared/models/address';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private clientMock: Client = {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@email.com',
    cpf: '12345678900',
    phoneNumber: '41999999999',
    password: '123456',
    salary: '5000',
    userAccess: 'client',
    address: {
      id: 1,
      cep: '80000000',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 12',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: Estado.PR
    }
  };

  getProfile(): Observable<Client> {
    return of(this.clientMock);
  }

  updateProfile(data: any): Observable<Client> {

    this.clientMock.name = data.name;
    this.clientMock.phoneNumber = data.phoneNumber;
    this.clientMock.email = data.email;
    this.clientMock.salary = data.salary;

    this.clientMock.address.cep = data.zipCode;
    this.clientMock.address.logradouro = data.street;
    this.clientMock.address.numero = data.number;
    this.clientMock.address.complemento = data.complement;
    this.clientMock.address.bairro = data.neighborhood;
    this.clientMock.address.cidade = data.city;
    this.clientMock.address.estado = data.state;

    return of(this.clientMock);
  }
}