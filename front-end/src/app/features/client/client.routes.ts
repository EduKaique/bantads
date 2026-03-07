import { Routes } from '@angular/router';
import { SaquePageComponent } from './pages/saque-page/saque-page.component';
import { SaqueSucessoPageComponent } from './pages/saque-sucesso-page/saque-sucesso-page.component';

export const clientRoutes: Routes = [
  { path: 'saque',         component: SaquePageComponent },
  { path: 'saque/sucesso', component: SaqueSucessoPageComponent },
];