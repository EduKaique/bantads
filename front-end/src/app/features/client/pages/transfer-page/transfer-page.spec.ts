import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { ClientAccountService } from '../../services/client-account.service';
import { TransferPage } from './transfer-page';

describe('TransferPage', () => {
  let component: TransferPage;
  let fixture: ComponentFixture<TransferPage>;
  let clientAccountService: jasmine.SpyObj<ClientAccountService>;

  beforeEach(async () => {
    clientAccountService = jasmine.createSpyObj<ClientAccountService>(
      'ClientAccountService',
      [
        'buscarContaOrigemTransferenciaPorCpf',
        'buscarContaTransferenciaPorNumero',
        'transferirEntreContas',
      ],
    );

    clientAccountService.buscarContaOrigemTransferenciaPorCpf.and.returnValue(
      of({
        numeroConta: '1234',
        saldoDisponivel: 1500,
      }),
    );

    clientAccountService.buscarContaTransferenciaPorNumero.and.returnValue(
      of({
        cliente: '09506382000',
        nome: 'Conta identificada',
        numero: '5678',
        saldo: 99836.4,
        limite: 10000,
        saldoDisponivel: 109836.4,
      }),
    );

    clientAccountService.transferirEntreContas.and.returnValue(
      of({
        conta: '1234',
        data: '2026-04-13T12:00:00Z',
        destino: '5678',
        saldo: 1490,
        valor: 10,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [TransferPage],
      providers: [
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
        {
          provide: ClientAccountService,
          useValue: clientAccountService,
        },
        {
          provide: ToastService,
          useValue: {
            error: jasmine.createSpy('error'),
            info: jasmine.createSpy('info'),
          },
        },
        provideNgxMask(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(
      clientAccountService.buscarContaOrigemTransferenciaPorCpf,
    ).toHaveBeenCalledWith('12345678900');
    expect(component.minhaContaLogada).toBe('1234');
    expect(component.availableBalance).toBe(1500);
    expect(component.transferForm.get('balance')?.value).toBe(
      formatCurrency(1500),
    );
  });

  it('deve buscar conta de destino pelo serviço de conta', () => {
    component.transferForm.get('accountNumber')?.setValue('5678');

    component.searchAccount();

    expect(
      clientAccountService.buscarContaTransferenciaPorNumero,
    ).toHaveBeenCalledWith('5678');
    expect(component.contaEncontrada).toBeTrue();
    expect(component.transferForm.get('name')?.value).toBe('Conta identificada');
    expect(component.transferForm.get('cpf')?.value).toBe('095.063.820-00');
  });

  it('deve enviar transferencia pelo serviço de conta', () => {
    component.contaEncontrada = true;
    component.transferForm.patchValue({
      accountNumber: '5678',
      amount: 'R$ 10,00',
    });

    component.confirmTransfer();

    expect(clientAccountService.transferirEntreContas).toHaveBeenCalledWith(
      '1234',
      {
        destino: '5678',
        valor: 10,
      },
    );
    expect(component.availableBalance).toBe(1490);
    expect(component.transferForm.get('balance')?.value).toBe(
      formatCurrency(1490),
    );
    expect(component.exibirModalSucesso).toBeTrue();
  });
});
