import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ConsultaExtratoPageComponent } from './008-consulta-de-extrato.component';
import { AuthService } from '../../../../core/auth/services/auth.service';

registerLocaleData(localePt);

describe('ConsultaExtratoPageComponent', () => {
  let component: ConsultaExtratoPageComponent;
  let fixture: ComponentFixture<ConsultaExtratoPageComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaExtratoPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            currentUserValue: {
              nome: 'Maria Santos',
              email: 'maria@bantads.com.br',
              cpf: '88877766655',
              tipo: 'cliente',
              access_token: 'token',
            },
          },
        },
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaExtratoPageComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTestingController
      .expectOne('http://localhost:8084/contas/cpf/88877766655')
      .flush({
        numeroConta: '2222',
        saldoDisponivel: 62090.25,
      });

    httpTestingController
      .expectOne('http://localhost:8084/contas/2222/extrato')
      .flush({
        conta: '2222',
        saldo: 62090.25,
        movimentacoes: [
          {
            data: '2026-04-14T02:45:02.197446Z',
            tipo: 'transferência',
            origem: '2222',
            destino: '3333',
            valor: 10,
          },
          {
            data: '2026-04-14T00:24:24.795258Z',
            tipo: 'transferência',
            origem: '2222',
            destino: '3333',
            valor: 50,
          },
        ],
      });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.saldoAtual()).toBe(62090.25);
    expect(component.transacoesPorData.length).toBeGreaterThan(0);
  });
});
