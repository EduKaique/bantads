import { Component, signal } from '@angular/core';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { ViaCepService, Endereco } from '../../../services/viacep.service';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/register-request';
import { CustomValidators } from '../../../../shared/utils/cpf-validator';
import { ToastService } from '../../../services/toast.service';
import { SuccessfulSignupComponent } from '../../components/successful-signup/successful-signup.component';

@Component({
  selector: 'app-signup-page',
  imports: [
    InputPrimaryComponent,
    SuccessfulSignupComponent,
    ReactiveFormsModule,
    MatStepperModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.css'],
})
export class SignupPageComponent {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  endereco?: Endereco;
  isLoading = signal(false);
  hide = signal(true);
  registerSuccess = signal(false);
  registerErrorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private viaCepService: ViaCepService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      nameUser: ['', [Validators.required, Validators.minLength(3)]],
      cpfUser: ['', {
        validators: [Validators.required, CustomValidators.useExistingCpfValidator()],
      }],
      email: ['', [Validators.required, Validators.email]],
      phoneUser: ['', [Validators.required]],
      salary: ['', [Validators.required]],
    });
    this.secondFormGroup = this.fb.group({
      cep: ['', [Validators.required]],
      address: ['', [Validators.required]],
      number: ['', [Validators.required]],
      complement: [''],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    this.registerErrorMessage = null;

    if (this.firstFormGroup.valid && this.secondFormGroup.valid) {
      const personalData = this.firstFormGroup.value;
      const addressData = this.secondFormGroup.value;

      const removeNonDigits = (value: string) => value.replace(/\D/g, '');

      const parseCurrency = (value: any): number => {
        if (!value) return 0;
        const cleanString = value.toString().replace(/[R$\s\.]/g, '').replace(',', '.');
        return parseFloat(cleanString);
      };

      const requestData: RegisterRequest = {
        nome: personalData.nameUser,
        cpf: removeNonDigits(personalData.cpfUser),
        email: personalData.email,
        salario: parseCurrency(personalData.salary),
        celular: removeNonDigits(personalData.phoneUser),
        cep: removeNonDigits(addressData.cep),
        logradouro: addressData.address,
        numero: addressData.number,
        complemento: addressData.complement,
        bairro: addressData.neighborhood,
        cidade: addressData.city,
        uf: addressData.state,
      };

      this.isLoading.set(true);

      this.authService.signup(requestData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.registerSuccess.set(true);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.registerErrorMessage = `Cadastro falhou: ${err.error?.message || 'Tente novamente mais tarde.'}`;
          console.log("Erro:" + err);
        },
      });
    } else {
      this.firstFormGroup.markAllAsTouched();
      this.secondFormGroup.markAllAsTouched();
    }
  }

  navigate() {
    this.router.navigate(['/login']);
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

  get cpfErrorMessage(): string {
    const control = this.firstFormGroup.get('cpfUser');
    if (control?.hasError('required')) return 'O CPF é obrigatório';
    return 'CPF inválido';
  }
}
