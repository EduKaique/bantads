import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { ViaCepService, Endereco } from '../../../../core/services/viacep.service';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { ToastService } from '../../../../core/services/toast.service';
import { ChangeDetectorRef } from '@angular/core';
import { User } from '../../../../shared/models/user';
import { Client } from '../../../../shared/models/client';

@Component({
  selector: 'app-alteracao-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    InputPrimaryComponent,
    AppSuccessModalComponent,
    MatIconModule
  ],
  templateUrl: './alteracao-perfil.html',
  styleUrls: ['./alteracao-perfil.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlteracaoPerfilComponent implements OnInit {

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  clienteOriginal!: Client;

  isLoading = false;
  updateError: string | null = null;
  showModal = false;

  balance!: number;
  managerName!: string;
  endereco?: Endereco;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private viaCepService: ViaCepService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.firstFormGroup = this.fb.group({
      nameUser: ['', [Validators.required, Validators.minLength(3)]],
      cpfUser: [{ value: '', disabled: true }],
      phoneUser: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      salary: ['', [Validators.required]]
    });

    this.secondFormGroup = this.fb.group({
      cep: ['', Validators.required],
      address: ['', Validators.required],
      number: ['', Validators.required],
      complement: [''],
      neighborhood: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required]
    });

    this.loadClientData();
  }

  private removeNonDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

  loadClientData() {

    this.clientService.buscaPerfil(1).subscribe({
      next: (cliente) => {

        this.clienteOriginal = cliente;

        this.firstFormGroup.patchValue({
          nameUser: cliente.name,
          cpfUser: cliente.cpf,
          phoneUser: cliente.phoneNumber,
          email: cliente.email,
          salary: cliente.salary
        });

        this.secondFormGroup.patchValue({
          cep: cliente.address.cep,
          address: cliente.address.logradouro,
          number: cliente.address.numero,
          complement: cliente.address.complemento,
          neighborhood: cliente.address.bairro,
          city: cliente.address.cidade,
          state: cliente.address.estado
        });

      },
      error: () => {
        this.toast.error('Erro', 'Não foi possível carregar os dados do cliente');
      }
    });

  }

  onSubmit() {
    this.updateError = null;
    this.isLoading = true;

    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    const personalData = this.firstFormGroup.getRawValue();
    const addressData = this.secondFormGroup.value;

    const salaryNumber = parseFloat(
      (personalData.salary || '0').replace(/\./g, '').replace(',', '.')
    );

    const updateData: Client = {
      ...this.clienteOriginal,

      name: personalData.nameUser,
      phoneNumber: this.removeNonDigits(personalData.phoneUser),
      email: personalData.email,
      salary: salaryNumber,

      address: {
        ...this.clienteOriginal.address,
        cep: this.removeNonDigits(addressData.cep),
        logradouro: addressData.address,
        numero: addressData.number,
        complemento: addressData.complement,
        bairro: addressData.neighborhood,
        cidade: addressData.city,
        estado: addressData.state
      }
    };

    this.clientService.atualizaUsuario(updateData).subscribe({

      next: (response) => {
        this.balance = response.balance;
        this.managerName = response.managerName;
        this.showModal = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: () => {
        this.isLoading = false;
        this.toast.error('Erro', 'Erro ao atualizar perfil');
        this.updateError = 'Ocorreu um erro ao atualizar o perfil.';
      }

    });

  }

  searchCep() {
    const cep = this.secondFormGroup.get('cep')?.value as string | null;

    if (!cep) return;

    this.viaCepService.buscarCep(cep).subscribe({
      next: (res) => {
        this.endereco = res;
        this.secondFormGroup.patchValue({
          address: res.logradouro || '',
          neighborhood: res.bairro || '',
          city: res.localidade || '',
          state: res.uf || ''
        });

      },
      error: () => {
        this.toast.error('Erro', 'Não foi possível buscar o CEP');
      }

    });

  }

  get isCepValid(): boolean {
    const cep = this.secondFormGroup.get('cep')?.value as string | null;
    if (!cep) return false;
    const digits = cep.replace(/\D/g, '');
    return digits.length === 8;
  }
}
