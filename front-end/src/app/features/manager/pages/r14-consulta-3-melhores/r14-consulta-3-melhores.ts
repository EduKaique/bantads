import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  InformacoesMelhorCliente,
  MelhoresClientesService,
} from '../../services/melhores-clientes.service';

@Component({
  selector: 'app-r14-consulta-3-melhores',
  imports: [CommonModule],
  templateUrl: './r14-consulta-3-melhores.html',
  styleUrl: './r14-consulta-3-melhores.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class R14Consulta3MelhorComponent implements OnInit {
  private readonly melhoresClientesService = inject(MelhoresClientesService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly melhoresClientes = signal<InformacoesMelhorCliente[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');

  ngOnInit(): void {
    this.carregarMelhoresClientes();
  }

  private carregarMelhoresClientes(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.melhoresClientesService
      .obter3MelhoresClientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clientes) => {
          this.melhoresClientes.set(clientes);
          this.carregando.set(false);
        },
        error: () => {
          this.erro.set('Erro ao carregar os melhores clientes.');
          this.carregando.set(false);
        },
      });
  }

  formatarCpf(cpf: string): string {
    const cpfNormalizado = cpf.replace(/\D/g, '');

    if (cpfNormalizado.length !== 11) {
      return cpf;
    }

    return cpfNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarSaldo(saldo: number): string {
    return saldo.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  consultarCliente(cliente: InformacoesMelhorCliente): void {
    this.router.navigate(['/gerente/consultar-cliente'], {
      queryParams: { cpf: cliente.cpf },
    });
  }
}
