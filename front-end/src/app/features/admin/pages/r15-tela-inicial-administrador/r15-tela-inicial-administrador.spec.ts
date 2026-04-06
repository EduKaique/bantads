import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { R15TelaInicialAdministrador } from './r15-tela-inicial-administrador';
import { GerentesDashboardService } from '../../services/gerentes-dashboard';

describe('R15TelaInicialAdministrador', () => {
  let component: R15TelaInicialAdministrador;
  let fixture: ComponentFixture<R15TelaInicialAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [R15TelaInicialAdministrador],
      providers: [
        {
          provide: GerentesDashboardService,
          useValue: {
            obterEstatisticas: jasmine.createSpy('obterEstatisticas').and.returnValue(
              of({
                totalGerentes: 1,
                totalClientes: 2,
                totalGerentesPositivos: 1,
                totalGerentesNegativos: 0,
              }),
            ),
            obterGerentesComDados: jasmine.createSpy('obterGerentesComDados').and.returnValue(
              of([
                {
                  cpf: '12345678900',
                  nome: 'Gerente Teste',
                  email: 'gerente@bantads.com.br',
                  celular: '41999999999',
                  totalClientes: 2,
                  totalSaldoPositivo: 1000,
                  totalSaldoNegativo: 100,
                },
              ]),
            ),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(R15TelaInicialAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
