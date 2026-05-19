import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { API_URL } from '../../../../core/configs/api.token';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ConsultarClientesComponent } from './consultar-clientes';

describe('ConsultarClientesComponent', () => {
  let component: ConsultarClientesComponent;
  let fixture: ComponentFixture<ConsultarClientesComponent>;
  let clienteService: jasmine.SpyObj<ClienteService>;
  let http: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    clienteService = jasmine.createSpyObj<ClienteService>('ClienteService', [
      'listarTodosClientes',
    ]);
    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);

    clienteService.listarTodosClientes.and.returnValue(of([]));
    http.get.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ConsultarClientesComponent],
      providers: [
        provideRouter([]),
        { provide: API_URL, useValue: 'http://localhost:3000' },
        { provide: ClienteService, useValue: clienteService },
        { provide: HttpClient, useValue: http },
        {
          provide: AuthService,
          useValue: {
            currentUserValue: { cpf: '12345678910' },
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
