import { Routes } from '@angular/router';
import { TelaInicialGerenteComponent } from './pages/tela-inicial-gerente/tela-inicial-gerente';

export const managerRoutes: Routes = [
  {
    path: 'pedidos-autocadastro',
    component: TelaInicialGerenteComponent,
  },
];
