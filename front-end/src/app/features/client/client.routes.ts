import {Routes} from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile';
import { ConsultaExtratoPageComponent } from './pages/008-consulta-de-extrato/008-consulta-de-extrato.component';
import { TransferPage } from './pages/transfer-page/transfer-page';
import { PaginaInicial } from './pages/pagina-inicial/pagina-inicial';

export const clientRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: PaginaInicial,
  },
  {
    path: 'extrato',
    component: ConsultaExtratoPageComponent,
  },
  {
    path: 'deposito',
    component: DepositPageComponent,
  },
  { path: 'saque',         component: SaquePageComponent },
  { path: 'saque/sucesso', component: SaqueSucessoPageComponent },
  {
    path: 'transfer',
    component: TransferPage,
  },
  { 
    path: 'updateProfile/:id',
    component: UpdateProfileComponent,
  },
];
