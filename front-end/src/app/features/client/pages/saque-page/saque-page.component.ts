import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
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

import { AuthService } from '../../../../core/auth/services/auth.service';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { DepositConfirmationModalComponent } from '../../components/deposit-confirmation-modal.component';

const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

const saqueAmountValidator: ValidatorFn = (
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
  selector: 'app-saque-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPrimaryComponent,
    DepositConfirmationModalComponent,
  ],
  templateUrl: './saque-page.component.html',
  styleUrls: ['./saque-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaquePageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly formatCurrency = formatCurrency;
  readonly saqueForm = this.formBuilder.nonNullable.group({
    valor: ['', [Validators.required, saqueAmountValidator]],
  });

  private readonly valorControl = this.saqueForm.controls.valor;

  saldoDisponivel = 0;
  minhaContaLogada = '';
  isSubmitting = false;
  exibirModalConfirmacao = false;

  constructor() {
    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado?.cpf) {
      this.carregarSaldo(usuarioLogado.cpf);
    } else {
      console.error('Usuário não identificado');
    }
  }

  get valorSaqueFormatado(): string {
    return formatCurrency(this.parseValor(this.valorControl.value));
  }

  get helperMessage(): string {
    if (this.hasFieldError(this.valorControl)) {
      if (this.valorControl.hasError('required')) {
        return '* Campo de preenchimento obrigatório';
      }

      return this.amountErrorMessage;
    }

    return '* Campo de preenchimento obrigatório';
  }

  get helperIsError(): boolean {
    return (
      this.hasFieldError(this.valorControl) &&
      !this.valorControl.hasError('required')
    );
  }

  get amountErrorMessage(): string {
    if (this.valorControl.hasError('required')) {
      return 'Informe o valor do saque.';
    }

    if (this.valorControl.hasError('currencyFormat')) {
      return 'Use um valor válido com até duas casas decimais.';
    }

    if (this.valorControl.hasError('positiveAmount')) {
      return 'O valor deve ser maior que zero.';
    }

    if (this.valorControl.hasError('saldoInsuficiente')) {
      return 'Saldo insuficiente para este saque.';
    }

    return 'Informe um valor válido.';
  }

  onEnviar(): void {
    this.saqueForm.markAllAsTouched();

    if (this.saqueForm.invalid) {
      return;
    }

    const valorNumerico = this.parseValor(this.valorControl.value);

    if (!valorNumerico) {
      this.valorControl.setErrors({ positiveAmount: true });
      return;
    }

    if (valorNumerico > this.saldoDisponivel) {
      this.valorControl.setErrors({ saldoInsuficiente: true });
      return;
    }

    this.exibirModalConfirmacao = true;
  }

  fecharModalConfirmacao(): void {
    if (!this.isSubmitting) {
      this.exibirModalConfirmacao = false;
    }
  }

  confirmarSaque(): void {
    const valorNumerico = this.parseValor(this.valorControl.value);

    if (!valorNumerico) {
      this.valorControl.setErrors({ positiveAmount: true });
      return;
    }

    this.isSubmitting = true;

    const payload = {
      contaOrigem: this.minhaContaLogada,
      valor: valorNumerico,
    };

    this.http
      .post<any>('http://localhost:3000/transacoes/saque', payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.exibirModalConfirmacao = false;
        })
      )
      .subscribe({
        next: () => {
          const cpf = this.authService.currentUserValue?.cpf;
          if (cpf) {
            this.carregarSaldo(cpf);
          }

          this.router.navigate(['/cliente/saque/sucesso'], {
            state: {
              valor: valorNumerico,
              dataHora: new Date().toISOString(),
            },
          });
        },
        error: (erro) => {
          this.valorControl.setErrors({ saldoInsuficiente: true });
          console.error(erro);
        },
      });
  }

  private carregarSaldo(cpf: string): void {
    this.http.get<any>(`http://localhost:3000/contas/cpf/${cpf}`).subscribe({
      next: (dadosConta) => {
        this.minhaContaLogada = dadosConta.numeroConta;
        const limite = dadosConta.limite || 0;
        this.saldoDisponivel = (dadosConta.saldoDisponivel || 0) + limite;
        this.changeDetectorRef.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao buscar saldo:', erro);
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private hasFieldError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  private parseValor(rawValue: string): number {
    const normalizedValue = normalizarValorMonetario(rawValue);
    return normalizedValue ?? 0;
  }
}

function normalizarValorMonetario(rawValue: string): number | null {
  const cleanedValue = rawValue
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  if (!cleanedValue || !amountPattern.test(cleanedValue.replace('.', ','))) {
    return null;
  }

  const normalizedValue = Number(cleanedValue);

  return Number.isFinite(normalizedValue) ? normalizedValue : null;
}
