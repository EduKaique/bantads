import { Routes } from '@angular/router';
import { ListagemGerentesComponent } from './pages/listagem-gerentes/listagem-gerentes';
import { RelatorioClientesComponent } from './pages/relatorio-clientes/relatorio-clientes';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'listar-gerentes',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'listar-gerentes',
    pathMatch: 'full',
  },
  {
    path: 'listar-gerentes',
    component: ListagemGerentesComponent,
  },

  {
    path: 'relatorio-clientes',
    component: RelatorioClientesComponent,
  }
];
