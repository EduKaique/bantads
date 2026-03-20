import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';
import { ListagemGerentesComponent } from './listagem-gerentes';
import { GerentesService } from '../../services/gerentes';

describe('ListagemGerentesComponent', () => {
  let component: ListagemGerentesComponent;
  let fixture: ComponentFixture<ListagemGerentesComponent>;
  let gerentesServiceSpy: jasmine.SpyObj<GerentesService>;

  beforeEach(async () => {
    gerentesServiceSpy = jasmine.createSpyObj<GerentesService>('GerentesService', ['listar']);
    gerentesServiceSpy.listar.and.returnValue(
      of([
        {
          cpf: '98574307084',
          nome: 'Geniéve',
          email: 'ger1@bantads.com.br',
          telefone: '(41) 8888-0001',
        },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [ListagemGerentesComponent],
      providers: [
        provideNgxMask(),
        { provide: GerentesService, useValue: gerentesServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListagemGerentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os gerentes na tabela', () => {
    expect(component.fonteDados.data).toEqual([
      {
        cpf: '98574307084',
        nome: 'Geniéve',
        email: 'ger1@bantads.com.br',
        telefone: '(41) 8888-0001',
      },
    ]);
  });
});
