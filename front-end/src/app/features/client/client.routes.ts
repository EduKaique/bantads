import { Routes } from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile';


export const clientRoutes: Routes = [
  {
    path: 'deposito',
    component: DepositPageComponent,
  },
  { 
    path: 'updateProfile/:id',
    component: UpdateProfileComponent,
  },
  { path: 'saque',         component: SaquePageComponent },
  { path: 'saque/sucesso', component: SaqueSucessoPageComponent },
];
