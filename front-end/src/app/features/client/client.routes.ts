import { Routes } from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';
import { ConsultaExtratoPageComponent } from './pages/008-consulta-de-extrato/008-consulta-de-extrato.component';
import { TransferPage } from './pages/transfer-page/transfer-page';
import { AlteracaoPerfilComponent } from './pages/alteracao-perfil/alteracao-perfil';

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
    path: 'transfer',
    component: TransferPage,
  },
  { 
    path: 'atualizaPerfil/:id',
    component: AlteracaoPerfilComponent,
  },
];
