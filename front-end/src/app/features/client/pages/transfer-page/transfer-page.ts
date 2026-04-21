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
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { formatCpf, formatCurrency } from '../../../../shared/utils/formatters';
import { DepositConfirmationModalComponent } from '../../components/deposit-confirmation-modal.component';

const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

interface RespostaContaPorCpf {
  numeroConta: string;
  saldoDisponivel: number;
}

interface RespostaContaPerfil {
  cliente: string;
  numero: string;
  saldo: number;
  limite: number;
}

interface RespostaTransferencia {
  conta: string;
  data: string;
  destino: string;
  saldo: number;
  valor: number;
}

const transferAmountValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const rawValue = String(control.value ?? '').trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = normalizarValorMonetario(rawValue);

  if (normalizedValue === null) {
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
  private readonly apiContaUrl = 'http://localhost:8084/contas';
  private readonly formBuilder = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

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
      transferAmountValidator,
    ]),
    balance: this.formBuilder.control({ value: '', disabled: true }),
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
  availableBalance = 0;

  buscandoConta = false;
  contaEncontrada = false;
  nomeDestino = '';
  cpfDestino = '';

  constructor() {
    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado?.cpf) {
      this.carregarSaldoOrigem(usuarioLogado.cpf);
    } else {
      this.atualizarSaldoDisponivel(0);
      this.exibirToast('Não foi possível identificar o usuário logado.');
    }

    this.accountNumberControl.valueChanges.subscribe(() => {
      this.limparContaDestino();
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

    const numeroDigitado = String(this.accountNumberControl.value ?? '').trim();

    if (numeroDigitado === this.minhaContaLogada) {
      this.exibirToast('Você não pode transferir para a sua própria conta.');
      return;
    }

    this.buscandoConta = true;

    this.http
      .get<RespostaContaPerfil>(`${this.apiContaUrl}/${numeroDigitado}`)
      .subscribe({
        next: (dados) => {
          this.buscandoConta = false;
          this.contaEncontrada = true;
          this.nomeDestino = 'Conta identificada';
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
          this.buscandoConta = false;
          this.limparContaDestino();
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

    if (transferAmount > this.availableBalance) {
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

    if (transferAmount > this.availableBalance) {
      this.amountControl.setErrors({ insufficientBalance: true });
      this.closeModal();
      return;
    }

    const payload = {
      destino: String(this.accountNumberControl.value ?? '').trim(),
      valor: transferAmount,
    };

    this.http
      .post<RespostaTransferencia>(
        `${this.apiContaUrl}/${this.minhaContaLogada}/transferir`,
        payload,
      )
      .subscribe({
        next: (resposta) => {
          this.closeModal();

          if (resposta.saldo !== null && resposta.saldo !== undefined) {
            this.atualizarSaldoDisponivel(Number(resposta.saldo));
          }

          this.valorEnviado = formatCurrency(transferAmount);
          this.successfulTransferTimestamp =
            resposta.data || new Date().toISOString();
          this.exibirModalSucesso = true;
          this.resetTransferForm();
        },
        error: (erro) => {
          this.closeModal();
          this.exibirToast(
            erro.error?.message || 'Erro ao processar a transferência.',
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
    this.http
      .get<RespostaContaPorCpf>(`${this.apiContaUrl}/cpf/${cpf}`)
      .subscribe({
        next: (dadosConta) => {
          this.minhaContaLogada = dadosConta.numeroConta;
          this.carregarDetalhesContaOrigem(dadosConta.numeroConta);
        },
        error: (erro) => {
          console.error('Erro ao buscar conta do cliente logado:', erro);
          this.exibirToast('Erro ao carregar o saldo disponível.');
        },
      });
  }

  private carregarDetalhesContaOrigem(numeroConta: string): void {
    this.http
      .get<RespostaContaPerfil>(`${this.apiContaUrl}/${numeroConta}`)
      .subscribe({
        next: (dadosConta) => {
          const saldo = Number(dadosConta.saldo ?? 0);
          const limite = Number(dadosConta.limite ?? 0);
          this.atualizarSaldoDisponivel(saldo + limite);
        },
        error: (erro) => {
          console.error(
            'Erro ao buscar detalhes da conta do cliente logado:',
            erro,
          );
          this.exibirToast('Erro ao carregar o saldo disponível.');
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

  private parseAmount(rawValue: string | null | undefined): number {
    const normalizedValue = normalizarValorMonetario(rawValue);
    return normalizedValue ?? 0;
  }

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
}

function normalizarValorMonetario(
  rawValue: string | null | undefined,
): number | null {
  const cleanedValue = rawValue
    ?.replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  if (!cleanedValue || !amountPattern.test(cleanedValue.replace('.', ','))) {
    return null;
  }

  const normalizedValue = Number(cleanedValue);

  return Number.isFinite(normalizedValue) ? normalizedValue : null;
}
