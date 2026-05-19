import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';

import { ToastService } from '../../../../core/services/toast.service';
import { ViaCepService } from '../../../../core/services/viacep.service';
import { ClienteService } from '../../../../core/services/cliente.service';
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
          provide: ClienteService,
          useValue: {
            buscarClientePorCpf: () =>
              of({
                nome: 'Cliente Teste',
                cpf: '12345678901',
                email: 'cliente@bantads.com.br',
                telefone: '41999999999',
                salario: 2500,
                endereco: {
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
