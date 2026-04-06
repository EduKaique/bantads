import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

import {
  AuthService,
  UserState,
} from '../../../core/auth/services/auth.service';
import { ClientAccountService } from './client-account.service';

class AuthServiceStub {
  private readonly currentUserSubject = new BehaviorSubject<UserState>({
    nome: 'Artur Falavinha',
    email: 'artur@bantads.com',
    tipo: 'cliente',
    access_token: 'token',
  });

  readonly currentUser$ = this.currentUserSubject.asObservable();

  get currentUserValue(): UserState {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: UserState): void {
    this.currentUserSubject.next(user);
  }
}

describe('ClientAccountService', () => {
  let service: ClientAccountService;
  let authService: AuthServiceStub;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        ClientAccountService,
        { provide: AuthService, useClass: AuthServiceStub },
      ],
    });

    service = TestBed.inject(ClientAccountService);
    authService = TestBed.inject(AuthService) as unknown as AuthServiceStub;
  });

  it('should create a seeded account for the authenticated client', async () => {
    const account = await firstValueFrom(service.getCurrentAccount());

    expect(account.holderName).toBe('Artur Falavinha');
    expect(account.availableBalance).toBeGreaterThan(0);
    expect(account.transactions.length).toBe(1);
  });

  it('should update balance and prepend the new deposit transaction', async () => {
    const currentAccount = await firstValueFrom(service.getCurrentAccount());

    const updatedAccount = await firstValueFrom(
      service.depositIntoCurrentAccount({
        amount: 120.5,
        description: 'Deposito por PIX',
      })
    );

    expect(updatedAccount.availableBalance).toBeCloseTo(
      currentAccount.availableBalance + 120.5,
      2
    );
    expect(updatedAccount.transactions[0].description).toBe('Deposito por PIX');
    expect(updatedAccount.transactions[0].type).toBe('deposit');
  });

  it('should reject non-positive deposits', (done) => {
    service.depositIntoCurrentAccount({ amount: 0 }).subscribe({
      next: () => fail('Expected an error for an invalid deposit amount.'),
      error: (error: Error) => {
        expect(error.message).toContain('maior que zero');
        done();
      },
    });
  });

  it('should block deposits when the session is not a client', (done) => {
    authService.setCurrentUser({
      nome: 'Employee Session',
      email: 'employee@bantads.com',
      tipo: 'gerente',
      access_token: 'token',
    });

    service.depositIntoCurrentAccount({ amount: 50 }).subscribe({
      next: () => fail('Expected an error for a non-client session.'),
      error: (error: Error) => {
        expect(error.message).toContain('Apenas clientes');
        done();
      },
    });
  });
});
