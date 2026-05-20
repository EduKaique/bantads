import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideNgxMask } from 'ngx-mask';

import { SaquePageComponent } from './saque-page.component';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClientService } from '../../services/client.service';
import { SaqueService } from '../../services/saque.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('SaquePageComponent', () => {
  let component: SaquePageComponent;
  let fixture: ComponentFixture<SaquePageComponent>;

  let mockRouter = { 
    navigate: jasmine.createSpy('navigate') 
  };
  
  let mockToastService = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error')
  };

  let mockAuthService = {
    currentUserValue: { cpf: '12345678910' }
  };

  let mockClientService = {
    buscaDadosConta: jasmine.createSpy('buscaDadosConta').and.returnValue(of({
      numeroConta: '123456-7',
      saldoDisponivel: 125.49,
      limite: 5000
    }))
  };

  let mockSaqueService = {
    realizarSaque: jasmine.createSpy('realizarSaque').and.returnValue(of({
      message: 'Saque realizado com sucesso!',
      novoSaldoOrigem: 25.49
    }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaquePageComponent, BrowserAnimationsModule], 
      providers: [
        provideNgxMask(),
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ClientService, useValue: mockClientService },
        { provide: SaqueService, useValue: mockSaqueService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaquePageComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges(); 
  });

  it('deve criar o componente e carregar o saldo no ngOnInit', () => {
    expect(component).toBeTruthy();
    
    expect(mockClientService.buscaDadosConta).toHaveBeenCalledWith('12345678910');
    
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