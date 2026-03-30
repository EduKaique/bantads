import { Component, OnInit } from '@angular/core';
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

import { SaqueConfirmacaoModalComponent } from '../../components/saque-confirmacao-modal/saque-confirmacao-modal.component';
import { SaqueService } from '../../services/saque.service';

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
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './saque-page.component.html',
  styleUrls: ['./saque-page.component.css'],
})
export class SaquePageComponent implements OnInit {
  saqueForm!: FormGroup;
  saldoDisponivel = 0;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private saqueService: SaqueService
  ) {}

  get saldoFormatado(): string {
    return this.saldoDisponivel.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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

  ngOnInit(): void {
    this.saqueForm = this.fb.group({
      valor: ['', [Validators.required, saqueValorValidator]],
    });

    this.saqueService.getSaldoDisponivel().subscribe((conta) => {
      this.saldoDisponivel = conta.saldo + conta.limite;
    });
  }

  onValorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSanitizado = this.sanitizarValor(input.value);

    if (input.value !== valorSanitizado) {
      input.value = valorSanitizado;
    }

    this.valorControl?.setValue(valorSanitizado, { emitEvent: false });
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
      if (!confirmado) {
        return;
      }

      this.saqueService.realizarSaque(valorNumerico).subscribe({
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
}
