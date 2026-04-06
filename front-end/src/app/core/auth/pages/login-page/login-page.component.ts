import {
  ChangeDetectorRef, 
  inject,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InputPrimaryComponent } from '../../../../shared/components/input-primary/input-primary.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    MatButtonModule,
    InputPrimaryComponent,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false; 
  loginErrorMessage: string | null = null;
  hide = signal(true);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit() {
    this.loginErrorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user) => {
        this.isLoading = false; 


        if (user && user.tipo) {
          const routes = {
            'cliente': '/cliente/home',
            'gerente': '/gerente/dashboard',
            'administrador': '/admin/dashboard',
          };
          this.router.navigate([routes[user.tipo] || '/']);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false; 

        this.loginErrorMessage = 'Login falhou. O e-mail ou a senha informados estão incorretos.';
        console.error('Login error:', err);

        this.cdr.detectChanges();
      },


    });
    
  }

  navigate() {
    this.router.navigate(['/signup']);
  }
}
