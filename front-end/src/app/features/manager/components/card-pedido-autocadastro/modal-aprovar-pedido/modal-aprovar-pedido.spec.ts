import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAprovarPedidoComponent } from './modal-aprovar-pedido';

describe('ModalAprovarPedido', () => {
  let component: ModalAprovarPedidoComponent;
  let fixture: ComponentFixture<ModalAprovarPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAprovarPedidoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAprovarPedidoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pedido', {
      id: 1,
      nome: 'Cliente Teste',
      email: 'cliente@bantads.com.br',
      cpf: '12345678900',
      salario: 1000,
      status: 'PENDENTE',
      endereco: {
        cep: '80000000',
        logradouro: 'Rua Teste',
        numero: '123',
        bairro: 'Centro',
        cidade: 'Curitiba',
        uf: 'PR',
      },
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
