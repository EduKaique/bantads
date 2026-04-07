import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { DepositConfirmationModalComponent } from '../../components/deposit-confirmation-modal.component';

const valorPattern = /^\d+(?:[.,]\d{1,2})?$/;

const saqueValorValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const valorBruto = String(control.value ?? '').trim();

  if (!valorBruto) return null;

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
  imports: [CommonModule, ReactiveFormsModule, DepositConfirmationModalComponent],
  templateUrl: './saque-page.component.html',
  styleUrls: ['./saque-page.component.css'],
})
export class SaquePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly formatCurrency = formatCurrency;

  saqueForm!: FormGroup;
  saldoDisponivel = 0;
  minhaContaLogada = '';
  isSubmitting = false;
  exibirModalConfirmacao = false;

  ngOnInit(): void {
    this.saqueForm = this.formBuilder.group({
      valor: ['', [Validators.required, saqueValorValidator]],
    });

    const usuarioLogado = this.authService.currentUserValue;

    if (usuarioLogado?.cpf) {
      this.carregarSaldo(usuarioLogado.cpf);
    } else {
      console.error('Usuário não identificado');
    }

    this.valorControl?.valueChanges.subscribe((valorAtual) => {
      const valorSanitizado = this.sanitizarValor(String(valorAtual ?? ''));
      if (valorAtual !== valorSanitizado) {
        this.aplicarValorSanitizado(valorSanitizado);
      }
    });
  }

  get valorControl() {
    return this.saqueForm.get('valor');
  }

  get valorSaqueFormatado(): string {
    const valorRaw = String(this.valorControl?.value ?? '').trim();
    const valorNumerico = parseFloat(
      valorRaw.replace(/\./g, '').replace(',', '.')
    );

    return formatCurrency(Number.isFinite(valorNumerico) ? valorNumerico : 0);
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
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
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
    const inicio = input.selectionStart ?? input.value.length;
    const fim = input.selectionEnd ?? input.value.length;

    event.preventDefault();

    const novoValor = `${input.value.slice(0, inicio)}${valorColado}${input.value.slice(fim)}`;
    const valorSanitizado = this.sanitizarValor(novoValor);

    input.value = valorSanitizado;
    this.aplicarValorSanitizado(valorSanitizado);
    this.valorControl?.markAsDirty();
    this.valorControl?.updateValueAndValidity();
  }

  onEnviar(): void {
    this.saqueForm.markAllAsTouched();

    if (this.saqueForm.invalid) return;

    const valorNumerico = this.obterValorNumerico();

    if (!valorNumerico) {
      this.valorControl?.setErrors({ min: true });
      return;
    }

    if (valorNumerico > this.saldoDisponivel) {
      this.valorControl?.setErrors({ saldoInsuficiente: true });
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
    const valorNumerico = this.obterValorNumerico();

    if (!valorNumerico) {
      this.valorControl?.setErrors({ min: true });
      return;
    }

    this.isSubmitting = true;

    const payload = {
      contaOrigem: this.minhaContaLogada,
      valor: valorNumerico,
    };

    this.http.post<any>('http://localhost:3000/transacoes/saque', payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.exibirModalConfirmacao = false;
      }))
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
          this.valorControl?.setErrors({ saldoInsuficiente: true });
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
      },
      error: (erro) => {
        console.error('Erro ao buscar saldo:', erro);
      }
    });
  }

  private obterValorNumerico(): number {
    const valorRaw = this.valorControl?.value as string;
    return parseFloat(valorRaw.replace(/\./g, '').replace(',', '.'));
  }

  private sanitizarValor(valorBruto: string): string {
    const valorNormalizado = valorBruto
      .replace(/\./g, ',')
      .replace(/[^\d,]/g, '');

    const [inteiro = '', ...decimais] = valorNormalizado.split(',');
    const decimal = decimais.join('').slice(0, 2);

    if (decimais.length === 0) return inteiro;

    return `${inteiro},${decimal}`;
  }

  private aplicarValorSanitizado(valor: string): void {
    queueMicrotask(() => {
      if (this.valorControl?.value !== valor) {
        this.valorControl?.setValue(valor, { emitEvent: false });
      }
    });
  }
}
