import { Routes } from '@angular/router';
import { LoginPageComponent } from './core/auth/pages/login-page/login-page.component';
import { SignupPageComponent } from './core/auth/pages/signup-page/signup-page.component';
import { PageNotFoundComponent } from './core/layout/page-not-found/page-not-found.component';
import { UnauthorizedPageComponent } from './core/layout/unauthorized-page/unauthorized-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'signup',
    component: SignupPageComponent,
  },
  {
    path: 'error-unauthorized',
    component: UnauthorizedPageComponent,
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
    // canActivate: [AuthGuard, RoleGuard],
    // data: { expectedRole: ['admin'] },
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes').then((m) => m.clientRoutes),
    // canActivate: [AuthGuard, RoleGuard],
    // data: { expectedRole: ['client'] },
  },
  {
    path: 'manager',
    loadChildren: () => import('./features/manager/manager.routes').then((m) => m.managerRoutes),
    // canActivate: [AuthGuard, RoleGuard],
    // data: { expectedRole: ['manager'] },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  }
];
