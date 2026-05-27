import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService } from '../auth/services/auth.service';
import { API_URL } from '../configs/api.token';
import { BankAccount } from '../../shared/models/bank-account';
import { ContaService } from './conta.service';

describe('ContaService', () => {
  const apiUrl = 'http://localhost:8080';
  const storageKey = 'client-account-state:cliente-bantads-com-br';
  const authServiceStub = {
    currentUserValue: {
      nome: 'Cliente Teste',
      email: 'cliente@bantads.com.br',
      cpf: '12345678900',
      tipo: 'CLIENTE' as const,
      access_token: 'fallback-token',
    },
  };

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: apiUrl },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('deve implementar POST /contas/{numero}/depositar com OperacaoResponse e Bearer', () => {
    const service = TestBed.inject(ContaService);

    service.depositar('1234', 250).subscribe((resposta) => {
      expect(resposta).toEqual({
        conta: '1234',
        data: '2026-05-24T12:00:00Z',
        saldo: 2750,
      });
    });

    const request = httpTestingController.expectOne(
      `${apiUrl}/contas/1234/depositar`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ valor: 250 });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    request.flush({
      conta: '1234',
      data: '2026-05-24T12:00:00Z',
      saldo: 2750,
    });
  });

  it('deve implementar POST /contas/{numero}/sacar com OperacaoResponse e Bearer', () => {
    const service = TestBed.inject(ContaService);

    service.sacar('1234', 100).subscribe((resposta) => {
      expect(resposta.saldo).toBe(2400);
    });

    const request = httpTestingController.expectOne(
      `${apiUrl}/contas/1234/sacar`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ valor: 100 });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    request.flush({
      conta: '1234',
      data: '2026-05-24T12:10:00Z',
      saldo: 2400,
    });
  });

  it('deve implementar POST /contas/{numero}/transferir com destino, valor, TransferenciaResponse e Bearer', () => {
    const service = TestBed.inject(ContaService);

    service
      .transferir('1234', { destino: '5678', valor: 75.5 })
      .subscribe((resposta) => {
        expect(resposta).toEqual({
          conta: '1234',
          data: '2026-05-24T12:20:00Z',
          destino: '5678',
          saldo: 2324.5,
          valor: 75.5,
        });
      });

    const request = httpTestingController.expectOne(
      `${apiUrl}/contas/1234/transferir`,
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ destino: '5678', valor: 75.5 });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    request.flush({
      conta: '1234',
      data: '2026-05-24T12:20:00Z',
      destino: '5678',
      saldo: 2324.5,
      valor: 75.5,
    });
  });

  it('deve implementar GET /contas/{numero}/saldo com SaldoResponse e Bearer', () => {
    const service = TestBed.inject(ContaService);

    service.consultarSaldo('1234').subscribe((resposta) => {
      expect(resposta).toEqual({
        cliente: '12345678900',
        conta: '1234',
        saldo: 2500,
      });
    });

    const request = httpTestingController.expectOne(
      `${apiUrl}/contas/1234/saldo`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    request.flush({
      cliente: '12345678900',
      conta: '1234',
      saldo: 2500,
    });
  });

  it('deve implementar GET /contas/{numero}/extrato com ItemExtratoResponse[] e Bearer', () => {
    const service = TestBed.inject(ContaService);

    service.consultarExtrato('1234').subscribe((resposta) => {
      expect(resposta.movimentacoes[0]).toEqual({
        data: '2026-05-24T12:30:00Z',
        tipo: 'DEPOSITO',
        origem: null,
        destino: '1234',
        valor: 200,
      });
    });

    const request = httpTestingController.expectOne(
      `${apiUrl}/contas/1234/extrato`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    request.flush({
      conta: '1234',
      saldo: 2700,
      movimentacoes: [
        {
          data: '2026-05-24T12:30:00Z',
          tipo: 'DEPOSITO',
          origem: null,
          destino: '1234',
          valor: 200,
        },
      ],
    });
  });

  it('deve normalizar CPF e usar token da sessao quando localStorage token nao existir', () => {
    localStorage.removeItem('token');
    const service = TestBed.inject(ContaService);

    service.buscarContaPorCpf('123.456.789-00').subscribe();

    const request = httpTestingController.expectOne(
      `${apiUrl}/contas/cpf/12345678900`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer fallback-token',
    );

    request.flush({
      numeroConta: '1234',
      saldoDisponivel: 2500,
    });
  });

  it('deve buscar o nome do cliente ao carregar conta para transferencia', () => {
    const service = TestBed.inject(ContaService);

    service.buscarContaTransferenciaPorNumero('5678').subscribe((resposta) => {
      expect(resposta).toEqual({
        cliente: '09506382000',
        nome: 'Joao Silva',
        numero: '5678',
        saldo: 1500,
        limite: 2250,
        saldoDisponivel: 3750,
      });
    });

    const contaRequest = httpTestingController.expectOne(
      `${apiUrl}/contas/5678`,
    );

    expect(contaRequest.request.method).toBe('GET');
    expect(contaRequest.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    contaRequest.flush({
      cliente: '09506382000',
      numero: '5678',
      saldo: 1500,
      limite: 2250,
      gerente: '64065268052',
      criacao: '2026-05-24T12:00:00Z',
    });

    const clienteRequest = httpTestingController.expectOne(
      `${apiUrl}/clientes/09506382000`,
    );

    expect(clienteRequest.request.method).toBe('GET');
    expect(clienteRequest.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );

    clienteRequest.flush({
      cpf: '09506382000',
      nome: 'Joao Silva',
      email: 'cli2@bantads.com.br',
    });
  });

  it('deve descartar saldo local quando a conta persistida pertence a outro CPF', () => {
    const staleAccount: BankAccount = {
      accountId: 'stale-account',
      branch: '0001',
      accountNumber: '9999',
      holderName: 'Outro Cliente',
      holderDocument: '000.000.000-00',
      availableBalance: 2500,
      manager: 'Gerente',
      transactions: [],
    };

    localStorage.setItem(storageKey, JSON.stringify(staleAccount));

    const service = TestBed.inject(ContaService);
    let account: BankAccount | undefined;
    const subscription = service.account$.subscribe((value) => {
      account = value;
    });

    subscription.unsubscribe();

    expect(account?.availableBalance).toBe(0);
    expect(account?.holderDocument).toBe('12345678900');
    expect(localStorage.getItem(storageKey)).toBeNull();
  });
});
