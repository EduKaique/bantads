import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaExtratoPageComponent } from './008-consulta-de-extrato.component';

describe('ConsultaExtratoPageComponent', () => {
  let component: ConsultaExtratoPageComponent;
  let fixture: ComponentFixture<ConsultaExtratoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaExtratoPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaExtratoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});