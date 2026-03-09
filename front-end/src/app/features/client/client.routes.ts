import { Routes } from '@angular/router';
import { ClientDashboardPageComponent } from './pages/client-dashboard-page.component';
import { DepositPageComponent } from './pages/deposit-page.component';

export const clientRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: ClientDashboardPageComponent,
  },
  {
    path: 'deposito',
    component: DepositPageComponent,
  },
];
