import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAprovarPedidoComponent } from './modal-aprovar-pedido';

describe('ModalAprovarPedido', () => {
  let component: ModalAprovarPedidoComponent;
  let fixture: ComponentFixture<ModalAprovarPedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAprovarPedidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAprovarPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
