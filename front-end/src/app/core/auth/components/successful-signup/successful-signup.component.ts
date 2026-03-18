import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


@Component({
  selector: 'app-successful-signup',
  imports: [MatIconModule],
  templateUrl: './successful-signup.component.html',
  styleUrl: './successful-signup.component.css'
})
export class SuccessfulSignupComponent {
  constructor(private router: Router) {}

  navigate() {
    this.router.navigate(['/login']);
  }
}
