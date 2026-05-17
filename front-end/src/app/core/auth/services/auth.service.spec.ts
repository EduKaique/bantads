import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import {
  AUTH_API_CONFIG,
  AuthApiConfig,
} from '../../configs/auth-api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  function setupAuthService(config: Partial<AuthApiConfig> = {}): void {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AUTH_API_CONFIG,
          useValue: {
            backendUrl: 'http://localhost:8080',
            mockUrl: 'http://localhost:3000',
            source: 'backend',
            ...config,
          } satisfies AuthApiConfig,
        },
      ],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    setupAuthService();

    expect(service).toBeTruthy();
  });

  it('deve autenticar usando o contrato do backend quando a flag estiver em backend', (done) => {
    setupAuthService({ source: 'backend' });

    service.login('cli1@bantads.com.br', 'tads').subscribe((user) => {
      expect(user?.email).toBe('cli1@bantads.com.br');
      expect(user?.cpf).toBe('12912861012');
      expect(user?.tipo).toBe('cliente');
      expect(localStorage.getItem('token')).toBe('backend-token');
      done();
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8080/login',
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'cli1@bantads.com.br',
      senha: 'tads',
    });

    request.flush({
      access_token: 'backend-token',
      token_type: 'bearer',
      tipo: 'CLIENTE',
      usuario: {
        nome: 'Catharyna',
        email: 'cli1@bantads.com.br',
        cpf: '12912861012',
      },
    });
  });

  it('deve autenticar usando o contrato do mock server quando a flag estiver em mock', (done) => {
    setupAuthService({ source: 'mock' });

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
