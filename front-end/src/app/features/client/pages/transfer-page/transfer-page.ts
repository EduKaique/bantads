import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { DepositConfirmationModalComponent } from '../../components/deposit-confirmation-modal.component';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { formatCpf, formatCurrency } from '../../../../shared/utils/formatters';
import { MatIconModule } from '@angular/material/icon';

const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

const transferAmountValidator: ValidatorFn = (
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
export class TransferPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly formatCurrency = formatCurrency;
  readonly transferForm = this.formBuilder.nonNullable.group({
    accountNumber: [
      '',
      [Validators.required, Validators.pattern(/^\d{4}$/)],
    ],
    amount: ['', [Validators.required, transferAmountValidator]],
  });

  private readonly accountNumberControl = this.transferForm.controls.accountNumber;
  private readonly amountControl = this.transferForm.controls.amount;

  isModalOpen = false;
  toastMessage = '';
  showToast = false;
  exibirModalSucesso = false;
  valorEnviado = '';
  successfulTransferTimestamp = '';

  minhaContaLogada = '';
  saldoDisponivel = 0;

  buscandoConta = false;
  contaEncontrada = false;
  nomeDestino = '';
  cpfDestino = '';

  constructor() {
    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado?.cpf) {
      this.carregarSaldoOrigem(usuarioLogado.cpf);
    } else {
      this.exibirToast('Não foi possível identificar o usuário logado.');
    }

    this.accountNumberControl.valueChanges.subscribe(() => {
      this.contaEncontrada = false;
      this.nomeDestino = '';
      this.cpfDestino = '';
    });
  }

  get helperMessage(): string {
    return '* Campo de preenchimento obrigatório';
  }

  get helperIsError(): boolean {
    return false;
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

  exibirToast(mensagem: string): void {
    this.toastMessage = mensagem;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  searchAccount(): void {
    if (this.accountNumberControl.invalid) {
      this.accountNumberControl.markAsTouched();
      return;
    }

    const numeroDigitado = this.accountNumberControl.value;

    if (numeroDigitado === this.minhaContaLogada) {
      this.exibirToast('Você não pode transferir para a sua própria conta.');
      return;
    }

    this.buscandoConta = true;

    this.http
      .get<any>(`http://localhost:3000/contas/${numeroDigitado}`)
      .subscribe({
        next: (dados) => {
          this.buscandoConta = false;
          this.contaEncontrada = true;
          this.nomeDestino = dados.nome;
          this.cpfDestino = formatCpf(dados.cpf);
        },
        error: (erro) => {
          this.buscandoConta = false;
          this.contaEncontrada = false;
          this.nomeDestino = '';
          this.cpfDestino = '';
          this.exibirToast('Conta não encontrada na base de dados.');
          console.error(erro);
        },
      });
  }

  onSubmit(): void {
    this.transferForm.markAllAsTouched();

    if (this.transferForm.invalid) {
      return;
    }

    if (!this.contaEncontrada) {
      this.exibirToast('Busque e valide a conta de destino antes de transferir.');
      return;
    }

    const transferAmount = this.parseAmount(this.amountControl.value);

    if (!transferAmount) {
      this.amountControl.setErrors({ positiveAmount: true });
      return;
    }

    if (transferAmount > this.saldoDisponivel) {
      this.amountControl.setErrors({ insufficientBalance: true });
      return;
    }

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  confirmTransfer(): void {
    const transferAmount = this.parseAmount(this.amountControl.value);

    if (!transferAmount) {
      this.amountControl.setErrors({ positiveAmount: true });
      return;
    }

    const payload = {
      contaOrigem: this.minhaContaLogada,
      contaDestino: this.accountNumberControl.value,
      valor: transferAmount,
    };

    this.http
      .post<any>('http://localhost:3000/transacoes/transferir', payload)
      .subscribe({
        next: (resposta) => {
          this.closeModal();

          if (
            resposta.novoSaldoOrigem !== null &&
            resposta.novoSaldoOrigem !== undefined
          ) {
            this.saldoDisponivel = resposta.novoSaldoOrigem;
          }

          this.valorEnviado = formatCurrency(transferAmount);
          this.successfulTransferTimestamp = new Date().toISOString();
          this.exibirModalSucesso = true;
          this.resetTransferForm();
        },
        error: (erro) => {
          this.closeModal();
          this.exibirToast(
            erro.error?.message || 'Erro ao processar a transferência.'
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
    this.http.get<any>(`http://localhost:3000/contas/cpf/${cpf}`).subscribe({
      next: (dadosConta) => {
        this.minhaContaLogada = dadosConta.numeroConta;
        this.saldoDisponivel = dadosConta.saldoDisponivel || 0;
      },
      error: (erro) => {
        console.error('Erro ao buscar conta do cliente logado:', erro);
        this.exibirToast('Erro ao carregar o saldo disponível.');
      },
    });
  }

  private parseAmount(rawValue: string): number {
    const normalizedValue = normalizarValorMonetario(rawValue);
    return normalizedValue ?? 0;
  }

  private resetTransferForm(): void {
    this.transferForm.reset({
      accountNumber: '',
      amount: '',
    });
    this.contaEncontrada = false;
    this.nomeDestino = '';
    this.cpfDestino = '';
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
