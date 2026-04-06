import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TransferPage } from './transfer-page';
import { AuthService } from '../../../../core/auth/services/auth.service';

describe('TransferPage', () => {
  let component: TransferPage;
  let fixture: ComponentFixture<TransferPage>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            currentUserValue: {
              cpf: '12345678900',
              nome: 'Cliente Teste',
              tipo: 'cliente',
              access_token: 'token',
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferPage);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTestingController
      .expectOne('http://localhost:3000/contas/cpf/12345678900')
      .flush({
        numeroConta: '1234',
        saldoDisponivel: 1000,
      });
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
