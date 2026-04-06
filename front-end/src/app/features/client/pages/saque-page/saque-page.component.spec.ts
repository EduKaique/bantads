import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ClientAccountService } from '../../services/client-account.service';
import { SaquePageComponent } from './saque-page.component';

describe('SaquePageComponent', () => {
  let component: SaquePageComponent;
  let fixture: ComponentFixture<SaquePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaquePageComponent],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open'),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
        {
          provide: ClientAccountService,
          useValue: {
            getCurrentAccount: () =>
              of({
                accountId: 'client-main-account',
                branch: '0001',
                accountNumber: '123456-7',
                holderName: 'Artur Falavinha',
                holderDocument: '12345678910',
                availableBalance: 125.49,
                limit: 5000,
                manager: 'Gerente Teste',
                transactions: [],
              }),
            withdrawFromCurrentAccount: jasmine
              .createSpy('withdrawFromCurrentAccount')
              .and.returnValue(of(null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SaquePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve sanitizar caracteres inválidos no input de valor', fakeAsync(() => {
    const input = document.createElement('input');
    input.value = 'abc12,3x';

    component.onValorInput({ target: input } as unknown as Event);
    flushMicrotasks();

    expect(input.value).toBe('12,3');
    expect(component.valorControl?.value).toBe('12,3');
  }));

  it('deve impedir teclas inválidas no campo de valor', () => {
    const evento = {
      key: 'a',
      ctrlKey: false,
      metaKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent;

    component.onValorKeydown(evento);

    expect(evento.preventDefault).toHaveBeenCalled();
  });

  it('deve permitir teclas numéricas no campo de valor', () => {
    const evento = {
      key: '3',
      ctrlKey: false,
      metaKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent;

    component.onValorKeydown(evento);

    expect(evento.preventDefault).not.toHaveBeenCalled();
  });

  it('deve sanitizar o conteúdo colado no campo de valor', fakeAsync(() => {
    const input = document.createElement('input');
    input.value = '';
    input.setSelectionRange(0, 0);

    const clipboardData = {
      getData: jasmine.createSpy('getData').and.returnValue('abc12,3x'),
    };

    const evento = {
      target: input,
      clipboardData,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as ClipboardEvent;

    component.onValorPaste(evento);
    flushMicrotasks();

    expect(evento.preventDefault).toHaveBeenCalled();
    expect(input.value).toBe('12,3');
    expect(component.valorControl?.value).toBe('12,3');
  }));
});
