import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarClientes } from './consultar-clientes';

describe('ConsultarClientes', () => {
  let component: ConsultarClientes;
  let fixture: ComponentFixture<ConsultarClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
