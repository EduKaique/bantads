import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ClienteService } from '../../../core/services/cliente.service';
import { PedidosAutocadastroService } from './pedidos-autocadastro';

describe('PedidosAutocadastroService', () => {
  let service: PedidosAutocadastroService;
  let clienteService: jasmine.SpyObj<ClienteService>;

  beforeEach(() => {
    clienteService = jasmine.createSpyObj<ClienteService>('ClienteService', [
      'listarParaAprovar',
      'aprovarCliente',
      'rejeitarCliente',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: ClienteService, useValue: clienteService },
      ],
    });

    service = TestBed.inject(PedidosAutocadastroService);
  });

  it('deve criar o service', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar os pedidos ordenados do mais recente para o mais antigo', () => {
    const pedidosRecebidos = [
      {
        cpf: '12912861012',
        nome: 'Catharyna',
        email: 'catharyna@example.com',
        salario: 10000,
        dataSolicitacao: '2026-03-14T10:00:00.000Z',
      },
      {
        cpf: '76179646090',
        nome: 'Coandrya',
        email: 'coandrya@example.com',
        salario: 1500,
        dataSolicitacao: '2026-03-14T10:20:00.000Z',
      },
    ];

    let pedidosOrdenados: unknown[] = [];

    clienteService.listarParaAprovar.and.returnValue(of(pedidosRecebidos));

    service.listar('12345678910').subscribe((pedidos) => {
      pedidosOrdenados = pedidos;
    });

    expect(clienteService.listarParaAprovar).toHaveBeenCalledWith('12345678910');
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

  it('deve normalizar salario formatado retornado pela API', () => {
    clienteService.listarParaAprovar.and.returnValue(of([
      {
        cpf: '12912861012',
        nome: 'Catharyna',
        email: 'catharyna@example.com',
        salario: 'R$ 10.000',
        dataSolicitacao: '2026-03-14T10:00:00.000Z',
      },
    ]));

    let pedidosRecebidos: unknown[] = [];

    service.listar('12345678910').subscribe((pedidos) => {
      pedidosRecebidos = pedidos;
    });

    expect(pedidosRecebidos).toEqual([
      {
        cpf: '12912861012',
        nome: 'Catharyna',
        salario: 10000,
        dataSolicitacao: '2026-03-14T10:00:00.000Z',
      },
    ]);
  });

  it('deve aprovar cliente usando rota de clientes', () => {
    clienteService.aprovarCliente.and.returnValue(of({}));

    service.aprovar('76179646090').subscribe();

    expect(clienteService.aprovarCliente).toHaveBeenCalledWith('76179646090');
  });

  it('deve rejeitar cliente usando rota de clientes', () => {
    clienteService.rejeitarCliente.and.returnValue(of(void 0));

    service.rejeitar('76179646090', 'Documentos inconsistentes').subscribe();

    expect(clienteService.rejeitarCliente).toHaveBeenCalledWith(
      '76179646090',
      'Documentos inconsistentes',
    );
  });

  it('deve delegar motivo em branco para validacao do service centralizado', () => {
    clienteService.rejeitarCliente.and.returnValue(of(void 0));

    service.rejeitar('76179646090', '   ').subscribe();

    expect(clienteService.rejeitarCliente).toHaveBeenCalledWith('76179646090', '   ');
  });
});
