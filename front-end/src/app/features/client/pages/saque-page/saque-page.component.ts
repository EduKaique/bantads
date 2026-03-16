import { Component, OnInit } from '@angular/core';
import {FormBuilder,FormGroup,Validators,ReactiveFormsModule,} from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SaqueService } from '../../services/saque.service';
import {SaqueConfirmacaoModalComponent,} from '../../components/saque-confirmacao-modal/saque-confirmacao-modal.component';

@Component({
  selector: 'app-saque-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './saque-page.component.html',
  styleUrls: ['./saque-page.component.css'],
})
export class SaquePageComponent implements OnInit {
  saqueForm!: FormGroup;
  saldoDisponivel: number = 0;

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
    const c = this.valorControl;
    if (!c || !c.touched || c.valid) return null;
    if (c.errors?.['required']) return 'Informe o valor do saque.';
    if (c.errors?.['min']) return 'O valor mínimo é R$ 0,01.';
    if (c.errors?.['saldoInsuficiente']) return 'Saldo insuficiente para este saque.';
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private saqueService: SaqueService
  ) {}

  ngOnInit(): void {
    this.saqueForm = this.fb.group({
      valor: ['', [Validators.required, Validators.min(0.01)]],
    });

    this.saqueService.getSaldoDisponivel().subscribe((conta) => {
      this.saldoDisponivel = conta.saldo + conta.limite;
    });
  }

  onEnviar(): void {
    this.saqueForm.markAllAsTouched();

    if (this.saqueForm.invalid) return;

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
      if (!confirmado) return;

      this.saqueService.realizarSaque(valorNumerico).subscribe({
        next: () => {
          this.router.navigate(['/client/saque/sucesso'], {
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
}