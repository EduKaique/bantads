import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PaginaInicial } from './pagina-inicial';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ContaService } from '../../../../core/services/conta.service';

registerLocaleData(localePt);

describe('PaginaInicial', () => {
  let component: PaginaInicial;
  let fixture: ComponentFixture<PaginaInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaInicial],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUserValue: {
              nome: 'Cliente Teste',
              email: 'cliente@bantads.com.br',
              cpf: '12345678910',
              tipo: 'CLIENTE',
              access_token: 'token',
            },
          },
        },
        {
          provide: ClienteService,
          useValue: {
            buscarContaPorCpf: jasmine.createSpy('buscarContaPorCpf').and.returnValue(
              of({
                saldoDisponivel: 3450.75,
                nome: 'Cliente Teste',
              }),
            ),
          },
        },
        {
          provide: ContaService,
          useValue: {
            buscarContaPorCpf: jasmine.createSpy('buscarContaPorCpf').and.returnValue(
              of({
                numeroConta: '1234',
                saldoDisponivel: 3450.75,
              }),
            ),
          },
        },
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaInicial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
