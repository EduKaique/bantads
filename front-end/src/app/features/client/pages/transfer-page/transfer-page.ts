import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { ContaService } from '../../../../core/services/conta.service';
import { ToastService } from '../../../../core/services/toast.service';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { normalizarValorMonetario } from '../../../../shared/utils/currency.utils';
import { formatCpf, formatCurrency } from '../../../../shared/utils/formatters';
import { positiveCurrencyAmountValidator } from '../../../../shared/validators/currency.validators';
import { DepositConfirmationModalComponent } from '../../components/deposit-confirmation-modal.component';

@Component({
  selector: 'app-transfer-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputPrimaryComponent,
    DepositConfirmationModalComponent,
    AppSuccessModalComponent,
    MatIconModule,
  ],
  templateUrl: './transfer-page.html',
  styleUrls: ['./transfer-page.css'],
})
export class TransferPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly contaService = inject(ContaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  readonly formatCurrency = formatCurrency;
  readonly transferForm = this.formBuilder.group({
    accountNumber: this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/^\d{4}$/),
    ]),
    name: this.formBuilder.control({ value: '', disabled: true }),
    cpf: this.formBuilder.control({ value: '', disabled: true }),
    amount: this.formBuilder.control('', [
      Validators.required,
      positiveCurrencyAmountValidator,
    ]),
    balance: this.formBuilder.control({ value: '', disabled: true }),
  });

  private readonly accountNumberControl = this.transferForm.controls.accountNumber;
  private readonly amountControl = this.transferForm.controls.amount;

  isModalOpen = false;
  exibirModalSucesso = false;
  valorEnviado = '';
  successfulTransferTimestamp = '';

  minhaContaLogada = '';
  saldoDisponivel = 0;
  availableBalance = 0;
  limiteContaOrigem = 0;

  carregandoDados = false;
  buscandoConta = false;
  contaEncontrada = false;
  nomeDestino = '';
  cpfDestino = '';

  ngOnInit(): void {
    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado?.cpf) {
      this.carregarSaldoOrigem(usuarioLogado.cpf);
    } else {
      this.atualizarSaldoDisponivel(0);
      this.toast.error(
        'Erro',
        'Não foi possível identificar o usuário logado.',
      );
    }

    this.accountNumberControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.limparContaDestino();
      });
  }

  get helperMessage(): string {
    if (this.carregandoDados) {
      return 'Carregando dados da conta...';
    }

    if (this.hasFieldError(this.accountNumberControl)) {
      if (this.accountNumberControl.hasError('required')) {
        return '* Campo de preenchimento obrigatório';
      }

      return this.accountNumberErrorMessage;
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
    if (this.carregandoDados) {
      return false;
    }

    return (
      (this.hasFieldError(this.accountNumberControl) &&
        !this.accountNumberControl.hasError('required')) ||
      (this.hasFieldError(this.amountControl) &&
        !this.amountControl.hasError('required'))
    );
  }

  get saldoDisponivelFormatado(): string {
    return formatCurrency(this.saldoDisponivel);
  }

  get valorTransferenciaFormatado(): string {
    return formatCurrency(this.parseAmount(this.amountControl.value));
  }

  get accountNumberErrorMessage(): string {
    if (this.accountNumberControl.hasError('required')) {
      return 'Informe a conta de destino.';
    }

    if (this.accountNumberControl.hasError('pattern')) {
      return 'Use um número de conta com 4 dígitos.';
    }

    return 'Informe uma conta válida.';
  }

  get amountErrorMessage(): string {
    if (this.amountControl.hasError('required')) {
      return 'Informe o valor da transferência.';
    }

    if (this.amountControl.hasError('currencyFormat')) {
      return 'Use um valor válido com até duas casas decimais.';
    }

    if (this.amountControl.hasError('positiveAmount')) {
      return 'O valor deve ser maior que zero.';
    }

    if (this.amountControl.hasError('insufficientBalance')) {
      return 'Saldo insuficiente para esta transferência.';
    }

    return 'Informe um valor válido.';
  }

  searchAccount(): void {
    if (this.carregandoDados) {
      return;
    }

    if (this.accountNumberControl.invalid) {
      this.accountNumberControl.markAsTouched();
      return;
    }

    const numeroDigitado = String(this.accountNumberControl.value ?? '').trim();

    if (numeroDigitado === this.minhaContaLogada) {
      this.toast.info(
        'Transferência',
        'Você não pode transferir para a sua própria conta.',
      );
      return;
    }

    this.buscandoConta = true;

    this.contaService
      .buscarContaTransferenciaPorNumero(numeroDigitado)
      .pipe(
        finalize(() => {
          this.buscandoConta = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dados) => {
          this.contaEncontrada = true;
          this.nomeDestino = dados.nome || 'Conta identificada';
          this.cpfDestino = dados.cliente ? formatCpf(dados.cliente) : '';
          this.transferForm.patchValue(
            {
              name: this.nomeDestino,
              cpf: this.cpfDestino,
            },
            { emitEvent: false },
          );
        },
        error: (erro) => {
          this.limparContaDestino();
          this.toast.error('Erro', 'Conta não encontrada na base de dados.');
          console.error(erro);
        },
      });
  }

  onSubmit(): void {
    if (this.carregandoDados) {
      this.toast.info(
        'Transferência',
        'Aguarde o carregamento dos dados da conta.',
      );
      return;
    }

    this.transferForm.markAllAsTouched();

    if (this.transferForm.invalid) {
      return;
    }

    if (!this.minhaContaLogada) {
      this.toast.error('Erro', 'Não foi possível carregar a conta de origem.');
      return;
    }

    if (!this.contaEncontrada) {
      this.toast.info(
        'Transferência',
        'Busque e valide a conta de destino antes de transferir.',
      );
      return;
    }

    const transferAmount = this.parseAmount(this.amountControl.value);

    if (!transferAmount) {
      this.amountControl.setErrors({ positiveAmount: true });
      return;
    }

    if (transferAmount > this.availableBalance) {
      this.amountControl.setErrors({ insufficientBalance: true });
      return;
    }

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // Confirma a transferência e sincroniza o estado local após a resposta da API.
  confirmTransfer(): void {
    const transferAmount = this.parseAmount(this.amountControl.value);

    if (!transferAmount) {
      this.amountControl.setErrors({ positiveAmount: true });
      return;
    }

    if (transferAmount > this.availableBalance) {
      this.amountControl.setErrors({ insufficientBalance: true });
      this.closeModal();
      return;
    }

    const payload = {
      destino: String(this.accountNumberControl.value ?? '').trim(),
      valor: transferAmount,
    };

    this.contaService
      .transferirEntreContas(this.minhaContaLogada, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resposta) => {
          this.closeModal();

          if (resposta.saldo !== null && resposta.saldo !== undefined) {
            this.atualizarSaldoDisponivel(
              Number(resposta.saldo) + this.limiteContaOrigem,
            );
          }

          this.valorEnviado = formatCurrency(transferAmount);
          this.successfulTransferTimestamp =
            resposta.data || new Date().toISOString();
          this.exibirModalSucesso = true;
          this.resetTransferForm();
        },
        error: (erro) => {
          this.closeModal();
          this.toast.error(
            'Erro',
            this.getErrorMessage(
              erro,
              'Erro ao processar a transferência.',
            ),
          );
          console.error(erro);
        },
      });
  }

  novaTransferencia(): void {
    this.exibirModalSucesso = false;
    this.valorEnviado = '';
    this.successfulTransferTimestamp = '';
    this.resetTransferForm();
  }

  private carregarSaldoOrigem(cpf: string): void {
    this.carregandoDados = true;
    this.contaService
      .buscarContaOrigemTransferenciaPorCpf(cpf)
      .pipe(
        finalize(() => {
          this.carregandoDados = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dadosConta) => {
          this.minhaContaLogada = dadosConta.numeroConta;
          this.limiteContaOrigem = dadosConta.limite;
          this.atualizarSaldoDisponivel(dadosConta.saldoDisponivel);
        },
        error: (erro) => {
          this.atualizarSaldoDisponivel(0);
          this.toast.error('Erro', 'Erro ao carregar o saldo disponível.');
          console.error('Erro ao buscar conta do cliente logado:', erro);
        },
      });
  }

  private atualizarSaldoDisponivel(valor: number): void {
    this.saldoDisponivel = valor;
    this.availableBalance = valor;
    this.transferForm.patchValue(
      { balance: formatCurrency(valor) },
      { emitEvent: false },
    );
  }

  private limparContaDestino(): void {
    this.contaEncontrada = false;
    this.nomeDestino = '';
    this.cpfDestino = '';
    this.transferForm.patchValue(
      {
        name: '',
        cpf: '',
      },
      { emitEvent: false },
    );
  }

  private hasFieldError(control: AbstractControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  private parseAmount(rawValue: string | null | undefined): number {
    const normalizedValue = normalizarValorMonetario(rawValue ?? '');
    return normalizedValue ?? 0;
  }

  // Reseta a operação sem perder o saldo carregado.
  private resetTransferForm(): void {
    this.transferForm.patchValue(
      {
        accountNumber: '',
        amount: '',
      },
      { emitEvent: false },
    );
    this.accountNumberControl.markAsPristine();
    this.accountNumberControl.markAsUntouched();
    this.amountControl.markAsPristine();
    this.amountControl.markAsUntouched();
    this.limparContaDestino();
    this.atualizarSaldoDisponivel(this.availableBalance);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: unknown } }).error
      ?.message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }
}
