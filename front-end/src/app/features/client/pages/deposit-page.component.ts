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
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { DepositRequest } from '../../../shared/models/deposit-request';
import { DepositConfirmationModalComponent } from '../components/deposit-confirmation-modal.component';
import { DepositSuccessStateComponent } from '../components/deposit-success-state.component';
import { AuthService } from '../../../core/auth/services/auth.service';
import { formatCurrency } from '../../../shared/utils/formatters';

const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

const depositAmountValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const rawValue = String(control.value ?? '').trim();

  if (!rawValue) return null;

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
  standalone: true,
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
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly formatCurrency = formatCurrency;

  // ✅ Dados da conta (igual transferência)
  availableBalance: number = 0;
  minhaContaLogada: string = '';

  readonly depositForm = this.formBuilder.nonNullable.group({
    amount: ['', [Validators.required, depositAmountValidator]],
  });

  private readonly amountControl = this.depositForm.controls.amount;

  isConfirmationVisible = false;
  isSubmitting = false;
  submissionError = '';
  successfulDepositTimestamp = '';

  private pendingDeposit: DepositRequest | null = null;

  constructor() {
    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado && usuarioLogado.cpf) {
      this.carregarSaldo(usuarioLogado.cpf);
    } else {
      console.error('Usuário não identificado');
    }
  }

  // ✅ Buscar saldo (igual transferência)
  private carregarSaldo(cpf: string): void {
    this.http.get<any>(`http://localhost:3000/contas/cpf/${cpf}`).subscribe({
      next: (dadosConta) => {
        this.minhaContaLogada = dadosConta.numeroConta;
        this.availableBalance = dadosConta.saldoDisponivel || 0;
      },
      error: (erro) => {
        console.error('Erro ao buscar saldo:', erro);
      }
    });
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = this.sanitizeAmountInput(input.value);

    if (input.value !== sanitizedValue) {
      input.value = sanitizedValue;
    }

    this.amountControl.setValue(sanitizedValue, { emitEvent: false });
    this.amountControl.markAsDirty();
    this.amountControl.updateValueAndValidity();
  }

  openConfirmation(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    const amount = this.parseAmount(this.amountControl.value);

    if (amount <= 0) {
      this.submissionError = 'Valor inválido para depósito.';
      return;
    }

    this.pendingDeposit = { amount };

    this.submissionError = '';
    this.isConfirmationVisible = true;
  }

  closeConfirmation(): void {
    if (this.isSubmitting) return;
    this.resetConfirmationState();
  }

  confirmDeposit(): void {
    const pendingDeposit = this.pendingDeposit;
    if (!pendingDeposit) return;

    this.isSubmitting = true;
    this.submissionError = '';

    const payload = {
      conta: this.minhaContaLogada,
      valor: pendingDeposit.amount
    };

    console.log('Enviando depósito:', payload);

    this.http.post<any>('http://localhost:3000/transacoes/depositar', payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          // ✅ Atualiza saldo após depósito
          const cpf = this.authService.currentUserValue?.cpf;
          if (cpf) {
            this.carregarSaldo(cpf);
          }

          this.successfulDepositTimestamp = new Date().toISOString();

          this.depositForm.reset({ amount: '' });
          this.resetConfirmationState();
        },
        error: (error) => {
          this.submissionError =
            error.error?.message || 'Erro ao realizar depósito.';
          this.resetConfirmationState();
        },
      });
  }

  hasFieldError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  get helperMessage(): string {
    if (this.submissionError) return this.submissionError;

    if (this.hasFieldError(this.amountControl)) {
      return this.amountErrorMessage;
    }

    return '* Campo de preenchimento obrigatório';
  }

  get helperIsError(): boolean {
    return (
      Boolean(this.submissionError) ||
      this.hasFieldError(this.amountControl)
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
    this.successfulDepositTimestamp = '';
    this.submissionError = '';
    this.depositForm.reset({ amount: '' });
  }

  private parseAmount(rawValue: string): number {
    return Number(rawValue.replace(',', '.'));
  }

  private resetConfirmationState(): void {
    this.isConfirmationVisible = false;
    this.pendingDeposit = null;
  }

  private sanitizeAmountInput(rawValue: string): string {
    const normalizedValue = rawValue
      .replace(/\./g, ',')
      .replace(/[^\d,]/g, '');

    const [integerPart = '', ...fractionChunks] =
      normalizedValue.split(',');

    const fractionPart = fractionChunks.join('').slice(0, 2);

    if (fractionChunks.length === 0) {
      return integerPart;
    }

    return `${integerPart},${fractionPart}`;
  }
}