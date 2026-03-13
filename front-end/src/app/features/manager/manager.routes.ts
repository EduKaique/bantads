import {Routes} from '@angular/router';
import { ConsultarClientesComponent } from './pages/consultar-clientes/consultar-clientes';

export const managerRoutes: Routes = [
    /* 
    Exemplo de rota pra manager
    {
      path: 'home',
      component: ManagerHomePageComponent,
    }
    */
     { 
       path: 'consultar-clientes',
       component: ConsultarClientesComponent,
     },
];