import { Routes } from '@angular/router';
import { ConsultarClientesComponent } from './pages/consultar-clientes/consultar-clientes';
import { TelaInicialGerenteComponent } from './pages/tela-inicial-gerente/tela-inicial-gerente';

export const managerRoutes: Routes = [
  {
    path: 'consultar-clientes',
    component: ConsultarClientesComponent,
  },
  {
    path: 'pedidos-autocadastro',
    component: TelaInicialGerenteComponent,
  },
];
