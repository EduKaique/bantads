import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
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

    service.listar().subscribe((pedidos) => {
      pedidosOrdenados = pedidos;
    });

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/manager/pedidos-autocadastro',
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
});
