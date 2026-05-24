import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';

import { SaquePageComponent } from './saque-page.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ContaService } from '../../../../core/services/conta.service';

describe('SaquePageComponent', () => {
  let component: SaquePageComponent;
  let fixture: ComponentFixture<SaquePageComponent>;

  let mockRouter = { 
    navigate: jasmine.createSpy('navigate') 
  };
  
  let mockAuthService = {
    currentUserValue: { cpf: '12345678910' }
  };

  let mockContaService = {
    buscarContaPorCpf: jasmine.createSpy('buscarContaPorCpf').and.returnValue(of({
      numeroConta: '123456-7',
      saldoDisponivel: 125.49
    })),
    buscarConta: jasmine.createSpy('buscarConta').and.returnValue(of({
      cliente: '12345678910',
      numero: '123456-7',
      saldo: 125.49,
      limite: 5000,
      gerente: 'Gerente Teste',
      criacao: '2026-04-14T00:00:00Z'
    })),
    sacar: jasmine.createSpy('sacar').and.returnValue(of({
      conta: '123456-7',
      data: '2026-04-14T00:00:00Z',
      saldo: 25.49
    })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaquePageComponent, BrowserAnimationsModule], 
      providers: [
        provideNgxMask(),
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ContaService, useValue: mockContaService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaquePageComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges(); 
  });

  it('deve criar o componente e carregar o saldo no ngOnInit', () => {
    expect(component).toBeTruthy();
    
    expect(mockContaService.buscarContaPorCpf).toHaveBeenCalledWith('12345678910');
    
    expect(component.saldoDisponivel).toBe(5125.49);
  });

  it('deve aceitar valor monetario valido', () => {
    component.saqueForm.controls.valor.setValue('12,30');

    expect(component.saqueForm.controls.valor.value).toBe('12,30');
    expect(component.saqueForm.valid).toBeTrue();
  });

  it('deve invalidar valor monetario com mais de duas casas decimais', () => {
    component.saqueForm.controls.valor.setValue('12,345');
    component.saqueForm.controls.valor.markAsTouched();

    expect(component.saqueForm.controls.valor.hasError('currencyFormat')).toBeTrue();
  });
});
