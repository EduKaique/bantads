import { Routes } from '@angular/router';
import { DepositPageComponent } from './pages/deposit-page.component';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';
<<<<<<< Updated upstream
import { UpdateProfileComponent } from './pages/update-profile/update-profile';

=======
import { AlteracaoPerfilComponent } from './pages/alteracao-perfil/alteracao-perfil';
import { ConsultaExtratoPageComponent } from './pages/008-consulta-de-extrato/008-consulta-de-extrato.component';
import { TransferPage } from './pages/transfer-page/transfer-page';
>>>>>>> Stashed changes

export const clientRoutes: Routes = [
  {
    path: 'deposito',
    component: DepositPageComponent,
  },
  { 
    path: 'atualizaPerfil/:id',
    component: AlteracaoPerfilComponent,
  },
  { path: 'saque',         component: SaquePageComponent },
  { path: 'saque/sucesso', component: SaqueSucessoPageComponent },
];
