import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';

import { SaqueConfirmacaoModalComponent } from '../../components/saque-confirmacao-modal/saque-confirmacao-modal.component';
import { ClientAccountService } from '../../services/client-account.service';
import { formatCurrency } from '../../../../shared/utils/formatters';

const valorPattern = /^\d+(?:[.,]\d{1,2})?$/;

const saqueValorValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const valorBruto = String(control.value ?? '').trim();

  if (!valorBruto) {
    return null;
  }

  if (!valorPattern.test(valorBruto)) {
    return { formatoMoeda: true };
  }

  const valorNormalizado = Number(valorBruto.replace(',', '.'));

  if (!Number.isFinite(valorNormalizado) || valorNormalizado <= 0) {
    return { min: true };
  }

  return null;
};

@Component({
  selector: 'app-saque-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './saque-page.component.html',
  styleUrls: ['./saque-page.component.css'],
})
export class SaquePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly clientAccountService = inject(ClientAccountService);
  private readonly destroyRef = inject(DestroyRef);

  readonly account$ = this.clientAccountService.getCurrentAccount();
  readonly formatCurrency = formatCurrency;

  saqueForm!: FormGroup;
  saldoDisponivel = 0;
  isSubmitting = false;

  ngOnInit(): void {
    this.saqueForm = this.formBuilder.group({
      valor: ['', [Validators.required, saqueValorValidator]],
    });

    this.valorControl?.valueChanges.subscribe((valorAtual) => {
      const valorSanitizado = this.sanitizarValor(String(valorAtual ?? ''));
      if (valorAtual !== valorSanitizado) {
        this.aplicarValorSanitizado(valorSanitizado);
      }
    });

    this.account$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((account) => {
        const limite = (account as any).limit ?? 5000;
        this.saldoDisponivel = account.availableBalance + limite;
      });
  }

  get valorControl() {
    return this.saqueForm.get('valor');
  }

  get erroValor(): string | null {
    const controle = this.valorControl;

    if (!controle || !controle.touched || controle.valid) {
      return null;
    }

    if (controle.errors?.['required']) {
      return 'Informe o valor do saque.';
    }

    if (controle.errors?.['formatoMoeda']) {
      return 'Use um valor válido com até duas casas decimais.';
    }

    if (controle.errors?.['min']) {
      return 'O valor mínimo é R$ 0,01.';
    }

    if (controle.errors?.['saldoInsuficiente']) {
      return 'Saldo insuficiente para este saque.';
    }

    return null;
  }

  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSanitizado = this.sanitizarValor(input.value);

    if (input.value !== valorSanitizado) {
      input.value = valorSanitizado;
    }

    this.aplicarValorSanitizado(valorSanitizado);
    this.valorControl?.markAsDirty();
    this.valorControl?.updateValueAndValidity();
  }

  onValorKeydown(event: KeyboardEvent): void {
    if (
      event.ctrlKey ||
      event.metaKey ||
      [
        'Backspace',
        'Delete',
        'Tab',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ].includes(event.key)
    ) {
      return;
    }

    if (/^\d$/.test(event.key) || event.key === ',' || event.key === '.') {
      return;
    }

    event.preventDefault();
  }

  onValorPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    const valorColado = event.clipboardData?.getData('text') ?? '';
    const inicioSelecao = input.selectionStart ?? input.value.length;
    const fimSelecao = input.selectionEnd ?? input.value.length;

    event.preventDefault();

    const proximoValor = `${input.value.slice(0, inicioSelecao)}${valorColado}${input.value.slice(fimSelecao)}`;
    const valorSanitizado = this.sanitizarValor(proximoValor);

    input.value = valorSanitizado;
    this.aplicarValorSanitizado(valorSanitizado);
    this.valorControl?.markAsDirty();
    this.valorControl?.updateValueAndValidity();
  }

  onEnviar(): void {
    this.saqueForm.markAllAsTouched();

    if (this.saqueForm.invalid) {
      return;
    }

    const valorRaw = this.valorControl?.value as string;
    const valorNumerico = parseFloat(
      valorRaw.replace(/\./g, '').replace(',', '.')
    );

    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      this.valorControl?.setErrors({ min: true });
      return;
    }

    if (valorNumerico > this.saldoDisponivel) {
      this.valorControl?.setErrors({ saldoInsuficiente: true });
      return;
    }

    const dialogRef = this.dialog.open(SaqueConfirmacaoModalComponent, {
      data: { valor: valorNumerico },
      panelClass: 'saque-modal-panel',
      backdropClass: 'saque-backdrop',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.isSubmitting = true;
      this.clientAccountService.withdrawFromCurrentAccount({ amount: valorNumerico })
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: () => {
            this.router.navigate(['/cliente/saque/sucesso'], {
              state: {
                valor: valorNumerico,
                dataHora: new Date().toISOString(),
              },
            });
          },
          error: (err: Error) => {
            this.valorControl?.setErrors({ saldoInsuficiente: true });
            console.error(err.message);
          },
        });
    });
  }

  private sanitizarValor(valorBruto: string): string {
    const valorNormalizado = valorBruto
      .replace(/\./g, ',')
      .replace(/[^\d,]/g, '');

    const [parteInteira = '', ...partesDecimais] =
      valorNormalizado.split(',');

    const parteDecimal = partesDecimais.join('').slice(0, 2);

    if (partesDecimais.length === 0) {
      return parteInteira;
    }

    return `${parteInteira},${parteDecimal}`;
  }

  private aplicarValorSanitizado(valorSanitizado: string): void {
    queueMicrotask(() => {
      if (this.valorControl?.value !== valorSanitizado) {
        this.valorControl?.setValue(valorSanitizado, { emitEvent: false });
      }
    });
  }
}
