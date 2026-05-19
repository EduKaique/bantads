import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SaqueService } from '../../services/saque.service';

import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { normalizarValorMonetario } from '../../../../shared/utils/currency.utils';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { DepositConfirmationModalComponent } from '../../components/deposit-confirmation-modal.component';
import { saqueAmountValidator } from '../../../../shared/utils/saque.validators';

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
export class SaquePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly saqueService = inject(SaqueService);
  private readonly clienteService = inject(ClienteService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  
  readonly formatCurrency = formatCurrency;
  readonly saqueForm = this.formBuilder.nonNullable.group({
    valor: ['', [Validators.required, saqueAmountValidator]],
  });

  private readonly valorControl = this.saqueForm.controls.valor;

  saldoDisponivel = 0;
  minhaContaLogada = '';
  isSubmitting = false;
  exibirModalConfirmacao = false;

  constructor() {}

  ngOnInit(): void {
    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado?.cpf) {
      this.carregarSaldo(usuarioLogado.cpf);
    } else {
      this.toastService.error('Erro de Sessão', 'Utilizador não identificado.');
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

    this.saqueService.realizarSaque({
      contaOrigem: this.minhaContaLogada,
      valor: valorNumerico,
    })
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.isSubmitting = false;
        this.exibirModalConfirmacao = false;
        this.changeDetectorRef.markForCheck();
      })
    )
    .subscribe({
      next: () => {
        const cpf = this.authService.currentUserValue?.cpf;
        if (cpf) this.carregarSaldo(cpf);
        this.toastService.success('Sucesso', 'Saque realizado com sucesso!');
        this.router.navigate(['/cliente/saque/sucesso'], {
          state: { valor: valorNumerico, dataHora: new Date().toISOString() },
        });
      },
      error: () => {
        this.valorControl.setErrors({ saldoInsuficiente: true });
        this.toastService.error('Operação recusada', 'Não foi possível processar o saque.');
      },
    });
  }

 private carregarSaldo(cpf: string): void {
    this.clienteService.buscarContaPorCpf(cpf)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dadosConta) => {
          this.minhaContaLogada = dadosConta.numeroConta;
          const limite = dadosConta.limite || 0;
          this.saldoDisponivel = (dadosConta.saldoDisponivel || 0) + limite;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.toastService.error('Erro', 'Falha ao buscar saldo.');
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
