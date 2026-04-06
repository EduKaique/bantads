import { Routes } from '@angular/router';
import { ConsultarClientesComponent } from './pages/consultar-clientes/consultar-clientes';
import { ConsultarClienteComponent } from './pages/013-consultar-cliente/013-consultar-cliente.component';
import { TelaInicialGerenteComponent } from './pages/tela-inicial-gerente/tela-inicial-gerente';
import { R14Consulta3MelhorComponent } from './pages/r14-consulta-3-melhores/r14-consulta-3-melhores';

export const managerRoutes: Routes = [
  {
    path: 'consultar-clientes',
    component: ConsultarClientesComponent,
  },
  {
    path: 'consultar-cliente',
    component: ConsultarClienteComponent,
  },
  {
    path: 'consultar-cliente/:cpf',
    component: ConsultarClienteComponent,
  },
  {
    path: 'pedidos-autocadastro',
    component: TelaInicialGerenteComponent,
  },
  {
    path: 'melhores-clientes',
    component: R14Consulta3MelhorComponent,
  },
];