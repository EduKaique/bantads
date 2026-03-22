import { ComponentFixture, TestBed } from '@angular/core/testing';

import { R14Consulta3Melhores } from './r14-consulta-3-melhores';

describe('R14Consulta3Melhores', () => {
  let component: R14Consulta3Melhores;
  let fixture: ComponentFixture<R14Consulta3Melhores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [R14Consulta3Melhores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(R14Consulta3Melhores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
