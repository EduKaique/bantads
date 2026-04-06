import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

export interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUserValue; 
  
  isMenuOpen = signal(false);
  menuItems: MenuItem[] = []; 

  private readonly MENU_OPTIONS: Record<string, MenuItem[]> = {
    CLIENTE: [
      { label: 'Home', route: '/cliente/home' },
      { label: 'Depósito', route: '/cliente/deposito' },
      { label: 'Saque', route: '/cliente/saque' },
      { label: 'Transferência', route: '/cliente/transferencia' },
      { label: 'Extrato', route: '/cliente/extrato' }
    ],
    GERENTE: [
      { label: 'Home (Pedidos)', route: '/gerente/pedidos-autocadastro' },
      { label: 'Listar Clientes', route: '/gerente/consultar-clientes' },
      { label: 'Consultar Cliente', route: '/gerente/consultar-cliente' },
      { label: 'Melhores Clientes', route: '/gerente/melhores-clientes' }
    ],
    ADMINISTRADOR: [
      { label: 'Home', route: '/admin/dashboard' },
      { label: 'Lista de Gerentes', route: '/admin/listar-gerentes' },
      { label: 'Relatório de Clientes', route: '/admin/relatorio-clientes' }
    ]
  };

  ngOnInit(): void {
    if (this.user && this.user.tipo) {
      this.menuItems = this.MENU_OPTIONS[this.user.tipo.toUpperCase()] || [];
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  logout() {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }

  editProfile() {
    this.isMenuOpen.set(false);
    this.router.navigate([`/cliente/alteracao-perfil/${this.user?.cpf}`]); 
  }
}