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
import { finalize } from 'rxjs';

import { DepositRequest } from '../../../shared/models/deposit-request';
import { DepositConfirmationModalComponent } from '../components/deposit-confirmation-modal.component';
import { DepositSuccessStateComponent } from '../components/deposit-success-state.component';
import { ClientAccountService } from '../services/client-account.service';

const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

const depositAmountValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const rawValue = String(control.value ?? '').trim();

  if (!rawValue) {
    return null;
  }

  if (!amountPattern.test(rawValue)) {
    return { currencyFormat: true };
  }

  const normalizedValue = Number(rawValue.replace(',', '.'));

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
    DepositConfirmationModalComponent,
    DepositSuccessStateComponent,
  ],
  templateUrl: './deposit-page.component.html',
  styleUrl: './deposit-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientAccountService = inject(ClientAccountService);
  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  readonly account$ = this.clientAccountService.getCurrentAccount();
  readonly depositForm = this.formBuilder.nonNullable.group({
    amount: ['', [Validators.required, depositAmountValidator]],
  });

  isConfirmationVisible = false;
  isSubmitting = false;
  submissionError = '';
  successfulDepositTimestamp = '';

  private pendingDeposit: DepositRequest | null = null;

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = this.sanitizeAmountInput(input.value);

    if (input.value !== sanitizedValue) {
      input.value = sanitizedValue;
    }

    this.depositForm.controls.amount.setValue(sanitizedValue, {
      emitEvent: false,
    });
    this.depositForm.controls.amount.markAsDirty();
    this.depositForm.controls.amount.updateValueAndValidity();
  }

  openConfirmation(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    this.pendingDeposit = {
      amount: this.parseAmount(this.depositForm.controls.amount.value),
    };
    this.submissionError = '';
    this.isConfirmationVisible = true;
  }

  closeConfirmation(): void {
    if (!this.isSubmitting) {
      this.isConfirmationVisible = false;
      this.pendingDeposit = null;
    }
  }

  confirmDeposit(): void {
    if (!this.pendingDeposit) {
      return;
    }

    this.isSubmitting = true;
    this.submissionError = '';

    this.clientAccountService
      .depositIntoCurrentAccount(this.pendingDeposit)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (account) => {
          this.successfulDepositTimestamp =
            account.transactions[0]?.performedAt ?? new Date().toISOString();
          this.depositForm.reset({ amount: '' });
          this.pendingDeposit = null;
          this.isConfirmationVisible = false;
        },
        error: (error: Error) => {
          this.submissionError = error.message;
          this.pendingDeposit = null;
          this.isConfirmationVisible = false;
        },
      });
  }

  hasFieldError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  get helperMessage(): string {
    if (this.submissionError) {
      return this.submissionError;
    }

    if (this.hasFieldError(this.depositForm.controls.amount)) {
      return this.amountErrorMessage;
    }

    return '* Campo de preenchimento obrigatório';
  }

  get helperIsError(): boolean {
    return Boolean(this.submissionError) || this.hasFieldError(this.depositForm.controls.amount);
  }

  get amountErrorMessage(): string {
    const control = this.depositForm.controls.amount;

    if (control.hasError('required')) {
      return 'Informe o valor do depósito.';
    }

    if (control.hasError('currencyFormat')) {
      return 'Use um valor válido com até duas casas decimais.';
    }

    if (control.hasError('positiveAmount')) {
      return 'O valor deve ser maior que zero.';
    }

    return 'Informe um valor válido.';
  }

  get pendingAmountLabel(): string {
    return this.pendingDeposit
      ? this.formatCurrency(this.pendingDeposit.amount)
      : this.formatCurrency(0);
  }

  private parseAmount(rawValue: string): number {
    return Number(rawValue.replace(',', '.'));
  }

  private sanitizeAmountInput(rawValue: string): string {
    const normalizedValue = rawValue.replace(/\./g, ',').replace(/[^\d,]/g, '');
    const [integerPart = '', ...fractionChunks] = normalizedValue.split(',');
    const fractionPart = fractionChunks.join('').slice(0, 2);

    if (fractionChunks.length === 0) {
      return integerPart;
    }

    return `${integerPart},${fractionPart}`;
  }
}