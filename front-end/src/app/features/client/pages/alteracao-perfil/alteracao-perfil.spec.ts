import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlteracaoPerfil } from './alteracao-perfil';

describe('AlteracaoPerfil', () => {
  let component: AlteracaoPerfil;
  let fixture: ComponentFixture<AlteracaoPerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlteracaoPerfil]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlteracaoPerfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
