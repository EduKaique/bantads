import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { API_URL } from '../../../core/configs/api.token';
import { GerentesService } from './gerentes';

describe('GerentesService', () => {
  let service: GerentesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });

    service = TestBed.inject(GerentesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve criar o service', () => {
    expect(service).toBeTruthy();
  });

  it('deve buscar a lista de gerentes no endpoint do admin', () => {
    const gerentesRecebidos = [
      {
        cpf: '98574307084',
        nome: 'Geniéve',
        email: 'ger1@bantads.com.br',
        telefone: '(41) 8888-0001',
      },
      {
        cpf: '64065268052',
        nome: 'Godophredo',
        email: 'ger2@bantads.com.br',
        telefone: '(41) 8888-0002',
      },
    ];

    let gerentesCarregados = [] as typeof gerentesRecebidos;

    service.listar().subscribe((gerentes) => {
      gerentesCarregados = gerentes;
    });

    const requisicao = httpTestingController.expectOne(
      'http://localhost:3000/admin/gerentes',
    );

    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(gerentesRecebidos);

    expect(gerentesCarregados).toEqual(gerentesRecebidos);
  });
});
