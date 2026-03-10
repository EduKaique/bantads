import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { AppSuccessModalComponent } from '../../../../shared/components/modal-mensagem/app-success-modal';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { MatIconModule } from '@angular/material/icon';
import { ViaCepService, Endereco } from '../../../../core/services/viacep.service';

@Component({
  selector: 'app-update-profile',
  standalone: true, 
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    InputPrimaryComponent,
    AppSuccessModalComponent,
    MatIconModule
  ],
  templateUrl: './update-profile.html',
  styleUrls: ['./update-profile.css']
})
export class UpdateProfileComponent implements OnInit {

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;

  clienteOriginal: any;
  showModal = false;

  endereco?: Endereco;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private viaCepService: ViaCepService
  ) {}

  ngOnInit(): void {

    this.firstFormGroup = this.fb.group({
      nameUser: ['', [Validators.required]],
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
      state: ['', Validators.required],
    });

    this.loadClientData();
  }

  loadClientData() {

    this.clientService.getProfile().subscribe(cliente => {

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

    });

  }

  onSubmit() {

    if (this.firstFormGroup.valid && this.secondFormGroup.valid) {

      const personalData = this.firstFormGroup.getRawValue();
      const addressData = this.secondFormGroup.value;


      const updateData = {
        name: personalData.nameUser,
        phoneNumber: personalData.phoneUser,
        email: personalData.email,
        salary: personalData.salary,

        zipCode: addressData.cep,
        street: addressData.address,
        number: addressData.number,
        complement: addressData.complement,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state
      };

      this.clientService.updateProfile(updateData).subscribe({
        next: () => {
          alert("Perfil atualizado com sucesso!");
        },
        error: (err) => console.error('Erro ao atualizar perfil', err)
      });

    } else {
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
    }

  }

  /* Search CEP - Copiado de web II - ainda vai ser ajustado */

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
          state: res.uf || '',
        });
      },
      error: (err) => console.error('Erro ao buscar CEP', err),
    });
  }

  get isCepValid(): boolean {
    const cep = this.secondFormGroup.get('cep')?.value as string | null;
    if (!cep) return false;

    const digits = cep.replace(/\D/g, '');
    return digits.length === 8;
  }

}
