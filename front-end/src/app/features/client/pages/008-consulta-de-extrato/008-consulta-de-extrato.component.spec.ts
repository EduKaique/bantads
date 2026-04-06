import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { of } from 'rxjs';
import { ConsultaExtratoPageComponent } from './008-consulta-de-extrato.component';
import { ClientAccountService } from '../../services/client-account.service';
import { AuthService } from '../../../../core/auth/services/auth.service';

registerLocaleData(localePt);

describe('ConsultaExtratoPageComponent', () => {
  let component: ConsultaExtratoPageComponent;
  let fixture: ComponentFixture<ConsultaExtratoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaExtratoPageComponent],
      providers: [
        {
          provide: ClientAccountService,
          useValue: {
            getCurrentAccount: jasmine.createSpy('getCurrentAccount').and.returnValue(
              of({
                availableBalance: 3450.75,
              }),
            ),
          },
        },
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
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaExtratoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
