import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';

import { ToastService } from '../../../../core/services/toast.service';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { ClientService } from '../../services/client.service';
import { AlteracaoPerfilComponent } from './alteracao-perfil';

describe('AlteracaoPerfilComponent', () => {
  let component: AlteracaoPerfilComponent;
  let fixture: ComponentFixture<AlteracaoPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlteracaoPerfilComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ cpf: '12345678901' }),
            },
          },
        },
        {
          provide: ClientService,
          useValue: {
            buscaPerfil: () =>
              of({
                name: 'Cliente Teste',
                cpf: '12345678901',
                email: 'cliente@bantads.com.br',
                phoneNumber: '41999999999',
                salary: 2500,
                address: {
                  cep: '80000000',
                  logradouro: 'Rua Teste',
                  numero: '100',
                  complemento: '',
                  bairro: 'Centro',
                  cidade: 'Curitiba',
                  uf: 'PR',
                },
              }),
          },
        },
        {
          provide: ViaCepService,
          useValue: {
            buscarCep: () => of({}),
          },
        },
        {
          provide: ToastService,
          useValue: {
            error: jasmine.createSpy('error'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlteracaoPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
