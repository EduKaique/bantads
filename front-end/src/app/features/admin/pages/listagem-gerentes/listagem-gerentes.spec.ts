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
        {
          cpf: '64065268052',
          nome: 'Godophredo',
          email: 'ger2@bantads.com.br',
          telefone: '(41) 8888-0002',
        },
        {
          cpf: '23862179060',
          nome: 'Gyândula',
          email: 'ger3@bantads.com.br',
          telefone: '(41) 8888-0003',
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
      {
        cpf: '64065268052',
        nome: 'Godophredo',
        email: 'ger2@bantads.com.br',
        telefone: '(41) 8888-0002',
      },
      {
        cpf: '23862179060',
        nome: 'Gyândula',
        email: 'ger3@bantads.com.br',
        telefone: '(41) 8888-0003',
      },
    ]);
  });

  it('deve exibir as colunas esperadas incluindo ações', () => {
    const cabecalhos = Array.from(
      fixture.nativeElement.querySelectorAll('th') as NodeListOf<HTMLElement>,
    ).map((elemento) =>
      elemento.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(cabecalhos).toEqual(['Nome', 'CPF', 'E-mail', 'Telefone', 'Ações']);
  });

  it('deve exibir uma célula de ações para cada gerente carregado', () => {
    const celulasAcao = fixture.nativeElement.querySelectorAll('.acoes-visuais');

    expect(celulasAcao.length).toBe(3);
  });

  it('deve filtrar os gerentes pelo CPF informado', () => {
    component.formularioFiltro.controls.cpf.setValue('238.621');
    fixture.detectChanges();

    expect(component.fonteDados.filteredData).toEqual([
      {
        cpf: '23862179060',
        nome: 'Gyândula',
        email: 'ger3@bantads.com.br',
        telefone: '(41) 8888-0003',
      },
    ]);
  });
});
