import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { AuthService } from './core/auth/services/auth.service';
import { Observable } from 'rxjs'; 
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  imports: [RouterOutlet, NgxSpinnerModule, HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Bantads';
  private authService = inject(AuthService)
  isLoggedIn = this.authService.isLoggedIn;

}
