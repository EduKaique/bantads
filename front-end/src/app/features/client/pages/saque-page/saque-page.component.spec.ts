import { FormBuilder } from '@angular/forms';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { SaquePageComponent } from './saque-page.component';
import { SaqueService } from '../../services/saque.service';

describe('SaquePageComponent', () => {
  let component: SaquePageComponent;
  let dialog: jasmine.SpyObj<MatDialog>;
  let router: jasmine.SpyObj<Router>;
  let saqueService: jasmine.SpyObj<SaqueService>;

  beforeEach(() => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    saqueService = jasmine.createSpyObj<SaqueService>('SaqueService', [
      'getSaldoDisponivel',
      'realizarSaque',
    ]);

    saqueService.getSaldoDisponivel.and.returnValue(
      of({
        saldo: 5125.49,
        limite: 5000,
      })
    );

    component = new SaquePageComponent(
      new FormBuilder(),
      dialog,
      router,
      saqueService
    );

    component.ngOnInit();
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
