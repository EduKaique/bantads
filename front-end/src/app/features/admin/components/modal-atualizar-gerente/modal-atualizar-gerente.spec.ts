import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAtualizarGerente } from './modal-atualizar-gerente';

describe('ModalAtualizarGerente', () => {
  let component: ModalAtualizarGerente;
  let fixture: ComponentFixture<ModalAtualizarGerente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAtualizarGerente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAtualizarGerente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
