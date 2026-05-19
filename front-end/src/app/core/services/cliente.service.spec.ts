import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { API_URL } from '../configs/api.token';
import { ClienteService } from './cliente.service';
import { CpfDuplicadoError } from '../../shared/models/cliente.models';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });

    service = TestBed.inject(ClienteService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve criar o service', () => {
    expect(service).toBeTruthy();
  });

  it('deve criar cliente em POST /clientes', () => {
    const dados = {
      cpf: '76179646090',
      nome: 'Cliente Teste',
      email: 'cliente@bantads.com.br',
      salario: 2500,
      celular: '41999999999',
      cep: '80000000',
      logradouro: 'Rua Teste',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Curitiba',
      uf: 'PR',
    };

    service.criarCliente(dados).subscribe();

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes',
    );

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual(dados);
    requisicao.flush(null, { status: 201, statusText: 'Created' });
  });

  it('deve converter conflito 409 em erro de CPF duplicado', (done) => {
    service.criarCliente({} as any).subscribe({
      next: () => done.fail('Esperava erro de CPF duplicado.'),
      error: (erro) => {
        expect(erro).toEqual(jasmine.any(CpfDuplicadoError));
        done();
      },
    });

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes',
    );

    requisicao.flush(
      { message: 'CPF duplicado' },
      { status: 409, statusText: 'Conflict' },
    );
  });

  [401, 403, 404, 500].forEach((status) => {
    it(`deve propagar erro HTTP ${status} sem mascarar`, (done) => {
      service.buscarClientePorCpf('761.796.460-90').subscribe({
        next: () => done.fail(`Esperava erro HTTP ${status}.`),
        error: (erro: HttpErrorResponse) => {
          expect(erro.status).toBe(status);
          done();
        },
      });

      const requisicao = httpTestingController.expectOne(
        'http://localhost:3000/clientes/76179646090',
      );

      requisicao.flush(
        { message: 'Erro controlado pelo backend.' },
        { status, statusText: 'Backend Error' },
      );
    });
  });

  it('deve buscar cliente por CPF normalizado', () => {
    service.buscarClientePorCpf('761.796.460-90').subscribe();

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes/76179646090',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush({});
  });

  it('deve atualizar perfil por CPF normalizado', () => {
    const perfil = {
      nome: 'Cliente Atualizado',
      email: 'cliente@bantads.com.br',
      salario: 3000,
      cep: '80000000',
      logradouro: 'Rua Teste',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR',
    };

    service.atualizarPerfil('761.796.460-90', perfil).subscribe();

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes/76179646090',
    );

    expect(requisicao.request.method).toBe('PUT');
    expect(requisicao.request.body).toEqual(perfil);
    requisicao.flush(null);
  });

  it('deve buscar conta do cliente por CPF normalizado', () => {
    service.buscarContaPorCpf('761.796.460-90').subscribe((resposta) => {
      expect(resposta.numeroConta).toBe('1234');
    });

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/contas/cpf/76179646090',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush({ numeroConta: '1234', saldoDisponivel: 100 });
  });

  it('deve listar clientes para aprovar com filtro e gerente', () => {
    service.listarParaAprovar('123.456.789-10').subscribe();

    const requisicao = httpTestingController.expectOne((request) =>
      request.url === 'http://localhost:3000/clientes' &&
      request.params.get('filtro') === 'para_aprovar' &&
      request.params.get('cpfGerente') === '12345678910',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush([]);
  });

  it('deve listar relatorio de clientes com filtro administrativo', () => {
    service.listarRelatorioClientes().subscribe();

    const requisicao = httpTestingController.expectOne((request) =>
      request.url === 'http://localhost:3000/clientes' &&
      request.params.get('filtro') === 'adm_relatorio_clientes',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush([]);
  });

  it('deve listar melhores clientes com filtro especifico', () => {
    service.listarMelhoresClientes().subscribe();

    const requisicao = httpTestingController.expectOne((request) =>
      request.url === 'http://localhost:3000/clientes' &&
      request.params.get('filtro') === 'melhores_clientes',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush([]);
  });

  it('deve aprovar cliente pela rota de clientes', () => {
    service.aprovarCliente('761.796.460-90').subscribe();

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes/76179646090/aprovar',
    );

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({});
    requisicao.flush({});
  });

  it('deve consultar aprovacao por saga', () => {
    service.consultarAprovacao('saga-1').subscribe();

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes/aprovacoes/saga-1',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush({});
  });

  it('deve rejeitar cliente com motivo normalizado', () => {
    service.rejeitarCliente('761.796.460-90', '  Documentos invalidos  ').subscribe();

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/clientes/76179646090/rejeitar',
    );

    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({ motivo: 'Documentos invalidos' });
    requisicao.flush(null);
  });

  it('deve bloquear rejeicao sem motivo', (done) => {
    service.rejeitarCliente('76179646090', '   ').subscribe({
      next: () => done.fail('Esperava erro de motivo obrigatorio.'),
      error: (erro) => {
        expect(erro.message).toContain('motivo');
        done();
      },
    });
  });
});
