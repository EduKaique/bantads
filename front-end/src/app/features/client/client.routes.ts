import { Routes } from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile';
import { ConsultaExtratoPageComponent } from './pages/008-consulta-de-extrato/008-consulta-de-extrato.component';
import { TransferPage } from './pages/transfer-page/transfer-page';

export const clientRoutes: Routes = [
  {
    path: 'consulta-extrato',
    component: ConsultaExtratoPageComponent,
  },
  {
    path: 'deposito',
    component: DepositPageComponent,
  },
  { path: 'saque',         component: SaquePageComponent },
  { path: 'saque/sucesso', component: SaqueSucessoPageComponent },
  {
    path: 'transferencia',
    component: TransferPage,
  },
  { 
    path: 'updateProfile/:id',
    component: UpdateProfileComponent,
  },
];
