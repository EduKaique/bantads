import { ComponentFixture, TestBed } from '@angular/core/testing';

import { R14Consulta3MelhorComponent } from './r14-consulta-3-melhores';

describe('R14Consulta3MelhorComponent', () => {
  let component: R14Consulta3MelhorComponent;
  let fixture: ComponentFixture<R14Consulta3MelhorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [R14Consulta3MelhorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(R14Consulta3MelhorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
