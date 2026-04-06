import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CardGerenteDashboardComponent } from './card-gerente-dashboard';

describe('CardGerenteDashboardComponent', () => {
  let component: CardGerenteDashboardComponent;
  let fixture: ComponentFixture<CardGerenteDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGerenteDashboardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGerenteDashboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gerente', {
      cpf: '12345678900',
      nome: 'Gerente Teste',
      email: 'gerente@bantads.com.br',
      celular: '41999999999',
      totalClientes: 2,
      totalSaldoPositivo: 1000,
      totalSaldoNegativo: 100,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
