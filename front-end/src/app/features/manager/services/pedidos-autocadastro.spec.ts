import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/configs/api.token';
import { PedidosAutocadastroService } from './pedidos-autocadastro';

describe('PedidosAutocadastroService', () => {
  let service: PedidosAutocadastroService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });

    service = TestBed.inject(PedidosAutocadastroService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve criar o service', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar os pedidos ordenados do mais recente para o mais antigo', () => {
    const pedidosRecebidos = [
      {
        cpf: '12912861012',
        nome: 'Catharyna',
        salario: 10000,
        dataSolicitacao: '2026-03-14T10:00:00.000Z',
      },
      {
        cpf: '76179646090',
        nome: 'Coandrya',
        salario: 1500,
        dataSolicitacao: '2026-03-14T10:20:00.000Z',
      },
    ];

    let pedidosOrdenados: unknown[] = [];

    service.listar('12345678910').subscribe((pedidos) => {
      pedidosOrdenados = pedidos;
    });

    const requisicao = httpTestingController.expectOne((request) =>
      request.url === 'http://localhost:3000/clientes' &&
      request.params.get('filtro') === 'para_aprovar' &&
      request.params.get('cpfGerente') === '12345678910'
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(pedidosRecebidos);

    expect(pedidosOrdenados).toEqual([
      {
        cpf: '76179646090',
        nome: 'Coandrya',
        salario: 1500,
        dataSolicitacao: '2026-03-14T10:20:00.000Z',
      },
      {
        cpf: '12912861012',
        nome: 'Catharyna',
        salario: 10000,
        dataSolicitacao: '2026-03-14T10:00:00.000Z',
      },
    ]);
  });

  it('deve aprovar cliente usando rota de clientes', () => {
    service.aprovar('76179646090').subscribe();

    const requisicao = httpTestingController.expectOne('http://localhost:3000/clientes/76179646090/aprovar');

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({});
    requisicao.flush({});
  });

  it('deve rejeitar cliente usando rota de clientes', () => {
    service.rejeitar('76179646090', 'Documentos inconsistentes').subscribe();

    const requisicao = httpTestingController.expectOne('http://localhost:3000/clientes/76179646090/rejeitar');

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({ motivo: 'Documentos inconsistentes' });
    requisicao.flush({});
  });
});
