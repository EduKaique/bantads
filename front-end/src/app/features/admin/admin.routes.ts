import { Routes } from '@angular/router';
import { ListagemGerentesComponent } from './pages/listagem-gerentes/listagem-gerentes';
import { R15TelaInicialAdministrador } from './pages/r15-tela-inicial-administrador/r15-tela-inicial-administrador';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: R15TelaInicialAdministrador,
  },
  {
    path: 'listar-gerentes',
    component: ListagemGerentesComponent,
  },
];
