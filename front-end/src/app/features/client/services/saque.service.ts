import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export interface ContaResumo {
  saldo: number;
  limite: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaqueService {

  private contaMock: ContaResumo = {
    saldo: 5125.49,
    limite: 5000.00,
  };

  getSaldoDisponivel(): Observable<ContaResumo> {
    return of(this.contaMock);
  }

  realizarSaque(valor: number): Observable<boolean> {
    if (valor <= 0) {
      return throwError(() => new Error('Valor do saque deve ser maior que zero.'));
    }

    const saldoTotal = this.contaMock.saldo + this.contaMock.limite;

    if (valor > saldoTotal) {
      return throwError(() => new Error('Saldo insuficiente para este saque.'));
    }

    this.contaMock.saldo -= valor;
    return of(true);
  }
}