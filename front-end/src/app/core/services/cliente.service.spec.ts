import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContaService } from './conta.service';
import { API_URL } from '../configs/api.token';
import { TransferenciaRequest, TransferenciaResponse } from '../../shared/models/conta';

describe('ContaService - Testes de Transferência', () => {
  let service: ContaService;
  let httpMock: HttpTestingController;
  const mockApiUrl = 'http://localhost:8080';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContaService,
        { provide: API_URL, useValue: mockApiUrl }
      ]
    });

    service = TestBed.inject(ContaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve injetar o serviço com sucesso', () => {
    expect(service).toBeTruthy();
  });

  it('deve realizar a transferência entre contas com sucesso via POST', () => {
    const numeroContaOrigem = '12345';
    const requestPayload: TransferenciaRequest = {
      destino: '67890',
      valor: 250.50
    };

    const mockResponse: TransferenciaResponse = {
      conta: '12345',
      data: new Date().toISOString(),
      destino: '67890',
      saldo: 1500.00,
      valor: 250.50
    };

    service.transferir(numeroContaOrigem, requestPayload).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.conta).toBe(numeroContaOrigem);
      expect(response.destino).toBe(requestPayload.destino);
      expect(response.valor).toBe(requestPayload.valor);
      expect(response.saldo).toBe(1500.00);
    });

    const req = httpMock.expectOne(`${mockApiUrl}/contas/${numeroContaOrigem}/transferir`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestPayload);
    req.flush(mockResponse);
  });

  it('deve retornar erro quando o backend rejeitar a transferência', () => {
    const numeroContaOrigem = '12345';
    const requestPayload: TransferenciaRequest = {
      destino: '99999',
      valor: 99999.00
    };

    service.transferir(numeroContaOrigem, requestPayload).subscribe({
      next: () => fail('A requisição deveria ter falhado devido ao saldo insuficiente'),
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne(`${mockApiUrl}/contas/${numeroContaOrigem}/transferir`);
    expect(req.request.method).toBe('POST');
    req.flush('Saldo insuficiente ou conta não encontrada', {
      status: 400,
      statusText: 'Bad Request'
    });
  });
});