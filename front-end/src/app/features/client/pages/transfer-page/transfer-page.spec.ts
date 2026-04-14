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
      .expectOne('http://localhost:8084/contas/cpf/12345678900')
      .flush({
        numeroConta: '1234',
        saldoDisponivel: 1000,
      });

    httpTestingController
      .expectOne('http://localhost:8084/contas/1234')
      .flush({
        cliente: '12345678900',
        numero: '1234',
        saldo: 1000,
        limite: 500,
      });
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.minhaContaLogada).toBe('1234');
    expect(component.availableBalance).toBe(1500);
    expect(component.transferForm.get('balance')?.value).toBe('R$ 1.500,00');
  });

  it('deve buscar conta de destino com contrato do backend', () => {
    component.transferForm.get('accountNumber')?.setValue('5678');

    component.searchAccount();

    httpTestingController
      .expectOne('http://localhost:8084/contas/5678')
      .flush({
        cliente: '09506382000',
        numero: '5678',
        saldo: 99836.4,
        limite: 10000,
      });

    expect(component.contaEncontrada).toBeTrue();
    expect(component.transferForm.get('name')?.value).toBe('Conta identificada');
    expect(component.transferForm.get('cpf')?.value).toBe('095.063.820-00');
  });

  it('deve enviar transferencia para o endpoint do ms-conta', () => {
    component.contaEncontrada = true;
    component.transferForm.patchValue({
      accountNumber: '5678',
      amount: 'R$ 10,00',
    });

    component.confirmTransfer();

    const requisicao = httpTestingController.expectOne('http://localhost:8084/contas/1234/transferir');
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual({
      destino: '5678',
      valor: 10,
    });

    requisicao.flush({
      conta: '1234',
      data: '2026-04-13T12:00:00Z',
      destino: '5678',
      saldo: 1490,
      valor: 10,
    });

    expect(component.availableBalance).toBe(1490);
    expect(component.transferForm.get('balance')?.value).toBe('R$ 1.490,00');
    expect(component.exibirModalSucesso).toBeTrue();
  });
});
