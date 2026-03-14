import {Routes} from '@angular/router';
import { ConsultarClienteComponent } from './pages/013-consultar-cliente/013-consultar-cliente.component';

export const managerRoutes: Routes = [
    {
      path: 'consultar-cliente',
      component: ConsultarClienteComponent,
    }
];