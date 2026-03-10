import { Routes } from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile';
import { ConsultaExtratoPageComponent } from './pages/008-consulta-de-extrato/008-consulta-de-extrato.component';

export const clientRoutes: Routes = [
  {
    path: 'consulta-extrato',
    component: ConsultaExtratoPageComponent,
  },
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
