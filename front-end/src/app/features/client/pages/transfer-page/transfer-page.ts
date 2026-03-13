import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';

@Component({
  selector: 'app-transfer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppSuccessModalComponent],
  templateUrl: './transfer-page.html',
  styleUrls: ['./transfer-page.css']
})
export class TransferPage implements OnInit {
  transferForm!: FormGroup;

  // Saldo mockado (obter depois via banco)
  availableBalance: number = 10125.49;
  isModalOpen: boolean = false;
  toastMessage: string = '';
  showToast: boolean = false;
  exibirModalSucesso: boolean = false; 
  valorEnviado: string = '';

  constructor(private fb: FormBuilder) {}

  exibirToast(mensagem: string): void {
    this.toastMessage = mensagem;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  ngOnInit(): void {
    // Inicializa o formulário e suas validações
    this.transferForm = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]], // Definir a quantidade de numeros, atualmente: 4
      name: [{ value: '', disabled: true }],
      cpf: [{ value: '', disabled: true }],
      amount: ['', [Validators.required]],
      balance: [{ value: 'R$ 10.125,49', disabled: true }]
    });
  }

  // Máscara de CPF
  onCpfInput(event: any) {
    let val = event.target.value.replace(/\D/g, '').slice(0, 11);
    if (val.length > 9) val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    else if (val.length > 6) val = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (val.length > 3) val = val.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    this.transferForm.patchValue({ cpf: val });
  }

  // Máscara de dinheiro
  onAmountInput(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (!val) {
      this.transferForm.patchValue({ amount: '' });
      return;
    }
    const num = parseInt(val, 10) / 100;
    const formatted = num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.transferForm.patchValue({ amount: 'R$ ' + formatted });
  }

  searchAccount(): void {
    const accountControl = this.transferForm.get('accountNumber');

    // Verifica se a conta é válida antes de preencher
    if (accountControl?.valid) {
      this.transferForm.patchValue({
        name: 'Catianna Silva',
        cpf: '857.338.540-57'
      });
    } else {
      this.exibirToast('Por favor, insira um valor válido.');
    }
  }

  onSubmit(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const rawAmount = this.transferForm.get('amount')?.value;
    if (!rawAmount) return;

    // Converte a string formatada de volta para número decimal
    const cleanAmountStr = rawAmount.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const transferAmount = parseFloat(cleanAmountStr);

    if (transferAmount > this.availableBalance) {
      this.exibirToast('Saldo insuficiente! Confira o seu limite.');
      return;
    }

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  confirmTransfer(): void {
    const rawAmount = this.transferForm.get('amount')?.value;
    
    // Converte a string formatada de volta para número decimal para o payload
    const cleanAmountStr = rawAmount.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const transferAmount = parseFloat(cleanAmountStr);

    // Monta o payload que será enviado para a API Gateway via Service
    const payload = {
      destinationAccount: this.transferForm.get('accountNumber')?.value,
      amount: transferAmount
  };

    console.log('Dados do envio:', payload);

    this.availableBalance -= transferAmount;

    const newBalanceFormatted = 'R$ ' + this.availableBalance.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });

    this.closeModal();
    this.transferForm.reset({
      balance: newBalanceFormatted
    });
    this.valorEnviado = transferAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    this.exibirModalSucesso = true;
  }
}