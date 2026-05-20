import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../services/toast.service';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const currentUser = this.authService.currentUserValue;

    const expectedRole = route.data['expectedRole'];

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    if (currentUser.tipo.toUpperCase() === expectedRole.toUpperCase()) {
      return true;
    }

    this.toast.error('Erro', 'Acesso negado');
    console.error(`Acesso negado. Rota exige role '${expectedRole}', mas o usuário tem role '${currentUser.tipo}'.`);
    this.router.navigate(['/error-unauthorized']); 
    return false;
  }
}