import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card-menu',
  imports: [MatIconModule],
  templateUrl: './card-menu.html',
  styleUrl: './card-menu.css',
})
export class CardMenu {
  icon = input.required<string>();
  label = input.required<string>();
  cardClick = output<void>();
}
