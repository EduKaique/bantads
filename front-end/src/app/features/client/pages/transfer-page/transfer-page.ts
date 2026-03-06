import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-page.html',
  styleUrls: ['./transfer-page.css']
})
export class TransferPage implements OnInit {
  transferForm!: FormGroup;
  
  // Saldo mockado (obter depois via banco)
  availableBalance: number = 10125.49; 

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Inicializa o formulário e suas validações
    this.transferForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]], // Definir a quantidade de numeros, atualmente: 4
      receiverName: [{ value: '', disabled: true }],
      receiverCpf: [{ value: '', disabled: true }],
      amount: ['', [Validators.required, Validators.min(0.01)]] // Valor mínimo de transferência
    });
  }

  searchAccount(): void {
    const accountControl = this.transferForm.get('accountNumber');
    
    if (accountControl?.valid) {      
      this.transferForm.patchValue({
        receiverName: 'Catianna Silva',
        receiverCpf: '857.338.540-57'
      });
    } else {
      alert('Por favor, insira um valor válido.');
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const transferAmount = this.transferForm.get('amount')?.value;

    if (transferAmount > this.availableBalance) {
      alert('Insufficient funds! Please check your limit.');
      return;
    }

    // Monta o payload que será enviado para a API Gateway via Service
    const payload = {
      destinationAccount: this.transferForm.get('accountNumber')?.value,
      amount: transferAmount
    };

    alert('Transferência concluída com sucesso!');
    
    this.transferForm.reset();
  }
}