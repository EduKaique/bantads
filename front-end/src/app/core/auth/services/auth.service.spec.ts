import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { API_URL } from '../../configs/api.token';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve autenticar usando o contrato do mock server', (done) => {
    service.login('cli1@bantads.com.br', 'tads').subscribe((user) => {
      expect(user?.email).toBe('cli1@bantads.com.br');
      expect(user?.cpf).toBe('12912861012');
      expect(user?.tipo).toBe('cliente');
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      done();
    });

    const request = httpTestingController.expectOne(
      'http://localhost:3000/auth/login',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'cli1@bantads.com.br',
      password: 'tads',
    });

    request.flush({
      access_token: 'fake-jwt-token',
      token_type: 'bearer',
      tipo: 'CLIENTE',
      usuario: {
        nome: 'Catharyna',
        email: 'cli1@bantads.com.br',
        cpf: '12912861012',
      },
    });
  });
});
