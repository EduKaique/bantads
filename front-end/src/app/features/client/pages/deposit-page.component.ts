import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AppSuccessModalComponent } from '../../../shared/components/modal-mensagem/app-success-modal';
import { DepositRequest } from '../../../shared/models/deposit-request';
import { formatCurrency } from '../../../shared/utils/formatters';
import { InputPrimaryComponent } from '../../../shared/components/input-primary/input-primary.component';
import { DepositConfirmationModalComponent } from '../components/deposit-confirmation-modal.component';
import { ClientAccountService } from '../services/client-account.service';

const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

const depositAmountValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const rawValue = String(control.value ?? '').trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = normalizarValorMonetario(rawValue);

  if (!rawValue || normalizedValue === null) {
    return { currencyFormat: true };
  }

  if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) {
    return { positiveAmount: true };
  }

  return null;
};

@Component({
  selector: 'app-deposit-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPrimaryComponent,
    DepositConfirmationModalComponent,
    AppSuccessModalComponent,
  ],
  templateUrl: './deposit-page.component.html',
  styleUrl: './deposit-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientAccountService = inject(ClientAccountService);
  private readonly router = inject(Router);

  readonly formatCurrency = formatCurrency;
  readonly account$ = this.clientAccountService.getCurrentAccount();
  readonly depositForm = this.formBuilder.nonNullable.group({
    amount: ['', [Validators.required, depositAmountValidator]],
  });

  private readonly amountControl = this.depositForm.controls.amount;

  isConfirmationVisible = false;
  isSubmitting = false;
  submissionError = '';
  exibirModalSucesso = false;
  successfulDepositTimestamp = '';
  successfulDepositAmountLabel = '';

  private pendingDeposit: DepositRequest | null = null;

  openConfirmation(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    this.pendingDeposit = {
      amount: this.parseAmount(this.amountControl.value),
    };

    this.submissionError = '';
    this.isConfirmationVisible = true;
  }

  closeConfirmation(): void {
    if (this.isSubmitting) {
      return;
    }

    this.resetConfirmationState();
  }

  confirmDeposit(): void {
    const pendingDeposit = this.pendingDeposit;

    if (!pendingDeposit) {
      return;
    }

    this.isSubmitting = true;
    this.submissionError = '';

    this.clientAccountService
      .depositIntoCurrentAccount(pendingDeposit)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (account) => {
          this.successfulDepositAmountLabel = formatCurrency(
            pendingDeposit.amount
          );
          this.successfulDepositTimestamp =
            account.transactions[0]?.performedAt ?? new Date().toISOString();
          this.exibirModalSucesso = true;

          this.depositForm.reset({ amount: '' });
          this.resetConfirmationState();
        },
        error: (error: Error) => {
          this.submissionError = error.message;
          this.resetConfirmationState();
        },
      });
  }

  hasFieldError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  get helperMessage(): string {
    if (this.submissionError) {
      return this.submissionError;
    }

    if (this.hasFieldError(this.amountControl)) {
      if (this.amountControl.hasError('required')) {
        return '* Campo de preenchimento obrigatório';
      }

      return this.amountErrorMessage;
    }

    return '* Campo de preenchimento obrigatório';
  }

  get helperIsError(): boolean {
    if (this.submissionError) {
      return true;
    }

    return (
      this.hasFieldError(this.amountControl) &&
      !this.amountControl.hasError('required')
    );
  }

  get amountErrorMessage(): string {
    if (this.amountControl.hasError('required')) {
      return 'Informe o valor do depósito.';
    }

    if (this.amountControl.hasError('currencyFormat')) {
      return 'Use um valor válido com até duas casas decimais.';
    }

    if (this.amountControl.hasError('positiveAmount')) {
      return 'O valor deve ser maior que zero.';
    }

    return 'Informe um valor válido.';
  }

  get pendingAmountLabel(): string {
    return formatCurrency(this.pendingDeposit?.amount ?? 0);
  }

  voltarAoInicio(): void {
    this.router.navigate(['/cliente/home']);
  }

  novoDeposito(): void {
    this.exibirModalSucesso = false;
    this.successfulDepositTimestamp = '';
    this.successfulDepositAmountLabel = '';
    this.submissionError = '';
    this.depositForm.reset({ amount: '' });
  }

  private parseAmount(rawValue: string): number {
    const valorNormalizado = normalizarValorMonetario(rawValue);
    return valorNormalizado ?? 0;
  }

  private resetConfirmationState(): void {
    this.isConfirmationVisible = false;
    this.pendingDeposit = null;
  }
}

function normalizarValorMonetario(rawValue: string): number | null {
  const valorLimpo = rawValue
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  if (!valorLimpo || !amountPattern.test(valorLimpo.replace('.', ','))) {
    return null;
  }

  const valorNormalizado = Number(valorLimpo);

  return Number.isFinite(valorNormalizado) ? valorNormalizado : null;
}
