import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClientAccountService } from '../../services/client-account.service';
import { SaquePageComponent } from './saque-page.component';

describe('SaquePageComponent', () => {
  let component: SaquePageComponent;
  let fixture: ComponentFixture<SaquePageComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaquePageComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open'),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            currentUserValue: {
              cpf: '12345678910',
            },
          },
        },
        {
          provide: ClientAccountService,
          useValue: {
            getCurrentAccount: () =>
              of({
                accountId: 'client-main-account',
                branch: '0001',
                accountNumber: '123456-7',
                holderName: 'Artur Falavinha',
                holderDocument: '12345678910',
                availableBalance: 125.49,
                limit: 5000,
                manager: 'Gerente Teste',
                transactions: [],
              }),
            withdrawFromCurrentAccount: jasmine
              .createSpy('withdrawFromCurrentAccount')
              .and.returnValue(of(null)),
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SaquePageComponent);
    component = fixture.componentInstance;
    httpTestingController.expectOne('http://localhost:3000/contas/cpf/12345678910').flush({
      numeroConta: '123456-7',
      saldoDisponivel: 125.49,
      limite: 5000,
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve aceitar valor monetario valido', () => {
    component.saqueForm.controls.valor.setValue('12,30');

    expect(component.saqueForm.controls.valor.value).toBe('12,30');
    expect(component.saqueForm.valid).toBeTrue();
  });

  it('deve invalidar valor monetario com mais de duas casas decimais', () => {
    component.saqueForm.controls.valor.setValue('12,345');
    component.saqueForm.controls.valor.markAsTouched();

    expect(component.saqueForm.controls.valor.hasError('currencyFormat')).toBeTrue();
  });
});
