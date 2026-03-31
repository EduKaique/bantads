import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { formatCpf } from '../../../../shared/utils/formatters';

@Component({
  selector: 'app-transfer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppSuccessModalComponent, MatIconModule],  
  templateUrl: './transfer-page.html',
  styleUrls: ['./transfer-page.css']
})
export class TransferPage implements OnInit {
  transferForm!: FormGroup;

  isModalOpen: boolean = false;
  toastMessage: string = '';
  showToast: boolean = false;
  exibirModalSucesso: boolean = false; 
  valorEnviado: string = '';

  minhaContaLogada: string = ''; 
  availableBalance: number = 0;

  buscandoConta: boolean = false;
  contaEncontrada: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

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
      accountNumber: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      name: [{ value: '', disabled: true }],
      cpf: [{ value: '', disabled: true }],
      amount: ['', [Validators.required]],
      balance: [{ value: 'Carregando...', disabled: true }]    
    });

    const usuarioLogado = this.authService.currentUserValue;
    if (usuarioLogado && usuarioLogado.cpf) {
      this.carregarSaldoOrigem(usuarioLogado.cpf);
    } else {
      this.transferForm.patchValue({ balance: 'Usuário não logado' });
      this.exibirToast('Não foi possível identificar o usuário logado.');
    }

    // Escuta alterações no campo da conta. Se o usuário digitar outro número, reseta a busca.
    this.transferForm.get('accountNumber')?.valueChanges.subscribe(() => {
      this.contaEncontrada = false;
      this.transferForm.patchValue({ name: '', cpf: '' }, { emitEvent: false });
    });
  }

  carregarSaldoOrigem(cpf: string): void {
    this.http.get<any>(`http://localhost:3000/contas/cpf/${cpf}`).subscribe({
      next: (dadosConta) => {
        this.minhaContaLogada = dadosConta.numeroConta; 
        this.availableBalance = dadosConta.saldoDisponivel || 0;
        
        const saldoFormatado = 'R$ ' + this.availableBalance.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });

        this.transferForm.patchValue({ balance: saldoFormatado });
      },
      error: (erro) => {
        console.error('Erro ao buscar conta do cliente logado:', erro);
        this.transferForm.patchValue({ balance: 'Erro ao carregar' });
      }
    });
  }

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

    if (accountControl?.valid) {
      this.buscandoConta = true;
      const numeroDigitado = accountControl.value;

      // Impede de transferir para a própria conta
      if (numeroDigitado === this.minhaContaLogada) {
        this.buscandoConta = false;
        this.exibirToast('Você não pode transferir para a sua própria conta.');
        return;
      }

      this.http.get<any>(`http://localhost:3000/contas/${numeroDigitado}`).subscribe({
        next: (dados) => {
          this.buscandoConta = false;
          this.contaEncontrada = true;
          this.transferForm.patchValue({
            name: dados.nome,
            cpf: formatCpf(dados.cpf)
          });
        },
        error: (erro) => {
          this.buscandoConta = false;
          this.contaEncontrada = false;
          this.exibirToast('Conta não encontrada na base de dados.');
          console.error(erro);
        }
      });
    } else {
      this.exibirToast('Por favor, insira um código de conta válido com 4 dígitos.');
    }
  }

  onSubmit(): void {
    if (!this.contaEncontrada) {
      this.exibirToast('Busque e valide a conta de destino antes de transferir.');
      return;
    }

    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const rawAmount = this.transferForm.get('amount')?.value;
    const cleanAmountStr = rawAmount.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const transferAmount = parseFloat(cleanAmountStr);

    if (transferAmount > this.availableBalance) {
      this.exibirToast('Saldo insuficiente para realizar esta transferência.');
      return;
    }

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  confirmTransfer(): void {
    const rawAmount = this.transferForm.get('amount')?.value;
    const cleanAmountStr = rawAmount.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    const transferAmount = parseFloat(cleanAmountStr);

    const payload = {
      contaOrigem: this.minhaContaLogada, // Pega dinamicamente a conta de quem logou
      contaDestino: this.transferForm.get('accountNumber')?.value,
      valor: transferAmount
    };

    console.log('Enviando para a API:', payload);

    // Requisição POST para o mock-server realizar a transferência
    this.http.post<any>('http://localhost:3000/transacoes/transferir', payload).subscribe({
      next: (resposta) => {
        this.closeModal();
        
        let newBalanceFormatted = 'R$ 0,00'; // fallback
        if (resposta.novoSaldoOrigem !== null && resposta.novoSaldoOrigem !== undefined) {
           this.availableBalance = resposta.novoSaldoOrigem;
           newBalanceFormatted = 'R$ ' + resposta.novoSaldoOrigem.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          });
        }

        this.transferForm.reset({
          balance: newBalanceFormatted
        });
        
        this.contaEncontrada = false;
        this.valorEnviado = transferAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        this.exibirModalSucesso = true;
      },
      error: (erro) => {
        this.closeModal();
        this.exibirToast(erro.error?.message || 'Erro ao processar a transferência.');
        console.error(erro);
      }
    });
  }
}