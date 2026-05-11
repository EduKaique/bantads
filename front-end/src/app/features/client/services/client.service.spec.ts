import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ClientService } from './client.service';
import { API_URL } from '../../../core/configs/api.token';

describe('ClientService', () => {
  let service: ClientService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });
    service = TestBed.inject(ClientService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve buscar perfil no endpoint real do gateway', () => {
    const cpf = '76179646090';
    const cliente = {
      cpf,
      nome: 'Cliente Teste',
      email: 'cliente.teste@bantads.com.br',
    };

    service.buscaPerfil(cpf).subscribe((resposta) => {
      expect(resposta as any).toEqual(cliente);
    });

    const requisicao = httpTestingController.expectOne(
      `http://localhost:3000/clientes/${cpf}`,
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(cliente);
  });

  it('deve atualizar perfil no endpoint real do gateway', () => {
    const cpf = '76179646090';
    const dadosCliente = {
      nome: 'Cliente Atualizado',
      celular: '(41) 98888-0000',
    };

    service.atualizaUsuario(cpf, dadosCliente).subscribe();

    const requisicao = httpTestingController.expectOne(
      `http://localhost:3000/clientes/${cpf}`,
    );

    expect(requisicao.request.method).toBe('PUT');
    expect(requisicao.request.body).toEqual(dadosCliente);
    requisicao.flush({
      balance: 1000,
      managerName: 'Gerente Teste',
      limit: 500,
    });
  });
});
