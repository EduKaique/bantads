import { ComponentFixture, TestBed } from '@angular/core/testing';

import { R15TelaInicialAdministrador } from './r15-tela-inicial-administrador';

describe('R15TelaInicialAdministrador', () => {
  let component: R15TelaInicialAdministrador;
  let fixture: ComponentFixture<R15TelaInicialAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [R15TelaInicialAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(R15TelaInicialAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
