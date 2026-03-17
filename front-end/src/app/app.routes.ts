import { Routes } from '@angular/router';
import { LoginPageComponent } from './core/auth/pages/login-page/login-page.component';
import { SignupPageComponent } from './core/auth/pages/signup-page/signup-page.component';
import { PageNotFoundComponent } from './core/layout/page-not-found/page-not-found.component';
import { UnauthorizedPageComponent } from './core/layout/unauthorized-page/unauthorized-page.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { RoleGuard } from './core/auth/guards/role.guard';
import { TelaInicialGerenteComponent } from './features/manager/pages/tela-inicial-gerente/tela-inicial-gerente';
import { ConsultarClienteComponent } from './features/manager/pages/013-consultar-cliente/013-consultar-cliente.component';

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
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'administrador' },
  },

  {
    path: 'cliente',
    loadChildren: () => import('./features/client/client.routes').then((m) => m.clientRoutes),
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'cliente' },
  },

  {
    path: 'gerente',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: 'gerente' },
    children: [
      {
        path: '',
        component: TelaInicialGerenteComponent,
      },
      {
        path: 'consultar-cliente',
        component: ConsultarClienteComponent,
      },
    ],
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  }
];
