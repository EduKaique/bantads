import {Routes} from '@angular/router';
import { UpdateProfileComponent } from './pages/update-profile/update-profile';

export const clientRoutes: Routes = [
    { 
      path: 'updateProfile/:id',
      component: UpdateProfileComponent,
    }
];