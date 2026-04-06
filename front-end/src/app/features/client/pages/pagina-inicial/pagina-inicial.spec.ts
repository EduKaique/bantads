import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PaginaInicial } from './pagina-inicial';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClientAccountService } from '../../services/client-account.service';

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
              tipo: 'cliente',
              access_token: 'token',
            },
          },
        },
        {
          provide: ClientAccountService,
          useValue: {
            getCurrentAccount: jasmine.createSpy('getCurrentAccount').and.returnValue(
              of({
                availableBalance: 3450.75,
                holderName: 'Cliente Teste',
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
