import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { BankAccount } from '../../../shared/models/bank-account';
import { ClientAccountService } from '../services/client-account.service';
import { DepositPageComponent } from './deposit-page.component';

class ClientAccountServiceStub {
  private readonly account: BankAccount = {
    accountId: 'client-main-account',
    branch: '0001',
    accountNumber: '123456-7',
    holderName: 'Artur Falavinha',
    holderDocument: '123.456.789-10',
    availableBalance: 2450.75,
    manager: 'Gerente Teste',
    transactions: [],
  };

  getCurrentAccount() {
    return of(this.account);
  }

  depositIntoCurrentAccount() {
    return of({
      ...this.account,
      transactions: [
        {
          id: 'deposit-1',
          type: 'deposit' as const,
          amount: 100,
          description: 'Deposito em conta',
          performedAt: '2026-03-07T12:00:00.000Z',
          balanceAfter: 2550.75,
        },
      ],
      availableBalance: 2550.75,
    });
  }
}

describe('DepositPageComponent', () => {
  let component: DepositPageComponent;
  let fixture: ComponentFixture<DepositPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepositPageComponent],
      providers: [
        { provide: ClientAccountService, useClass: ClientAccountServiceStub },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DepositPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept a valid monetary amount before confirmation', () => {
    component.depositForm.controls.amount.setValue('12,34');

    expect(component.depositForm.controls.amount.value).toBe('12,34');
    expect(component.depositForm.valid).toBeTrue();
  });
});
