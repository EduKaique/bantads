import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ContaResumo {
  saldo: number;
  limite: number;
}

@Injectable({
  providedIn: 'root',
})
export class SaqueService {

  //vai ser substituido no trabalho final para http.get por enquanto deixei um saldo mockado para teste
  private contaMock: ContaResumo = {
    saldo: 5125.49,
    limite: 5000.00,
  };

  getSaldoDisponivel(): Observable<ContaResumo> {
    return of(this.contaMock);
  }

  realizarSaque(valor: number): Observable<boolean> {
    if (valor <= this.contaMock.saldo + this.contaMock.limite) {
      this.contaMock.saldo -= valor;
      return of(true);
    }
    return of(false);
  }
}