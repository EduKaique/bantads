import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';
import { PedidosAutocadastroService } from '../../services/pedidos-autocadastro';

import { TelaInicialGerenteComponent } from './tela-inicial-gerente';

class PedidosAutocadastroServiceStub {
  listar() {
    return of([
      {
        cpf: '12912861012',
        nome: 'Catharyna',
        salario: 10000,
        dataSolicitacao: '2026-03-14T10:00:00.000Z',
      },
    ]);
  }
}

describe('TelaInicialGerenteComponent', () => {
  let component: TelaInicialGerenteComponent;
  let fixture: ComponentFixture<TelaInicialGerenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaInicialGerenteComponent],
      providers: [
        provideNgxMask(),
        {
          provide: PedidosAutocadastroService,
          useClass: PedidosAutocadastroServiceStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaInicialGerenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar um card para cada pedido carregado', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-card-pedido-autocadastro'));

    expect(cards.length).toBe(1);
  });
});
