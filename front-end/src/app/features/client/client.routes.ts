import { Routes } from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';

export const clientRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: DepositPageComponent,
  },
  {
    path: 'deposit',
    component: DepositPageComponent,
  },
];
