import {Routes} from '@angular/router';
import { TransferPage } from './pages/transfer-page/transfer-page';

export const clientRoutes: Routes = [
    /* 
    Exemplo de rota pra cliente
    {
      path: 'home',
      component: ClientHomePageComponent,
    }
    */
   {
    path: 'transfer',
    component: TransferPage,
  },
];