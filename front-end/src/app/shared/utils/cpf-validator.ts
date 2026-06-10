import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function validarCPF(cpf: string): boolean {
  const cpfNormalizado = normalizarCPF(cpf);

  if (!cpfNormalizado || possuiDigitosRepetidos(cpfNormalizado)) {
    return false;
  }

  const digitoVerificador1 = calcularDigitoVerificador(cpfNormalizado, 9);
  const digitoVerificador2 = calcularDigitoVerificador(cpfNormalizado, 10);

  return (
    cpfNormalizado.charAt(9) === digitoVerificador1.toString() &&
    cpfNormalizado.charAt(10) === digitoVerificador2.toString()
  );
}

function normalizarCPF(cpf: string): string | null {
  const cpfNormalizado = cpf.replace(/\D/g, '');

  return cpfNormalizado.length === 11 ? cpfNormalizado : null;
}

function possuiDigitosRepetidos(cpf: string): boolean {
  return /^(\d)\1{10}$/.test(cpf);
}

function calcularDigitoVerificador(
  cpf: string,
  quantidadeDigitos: number,
): number {
  const soma = cpf
    .slice(0, quantidadeDigitos)
    .split('')
    .reduce((total, digito, indice) => {
      const peso = quantidadeDigitos + 1 - indice;
      return total + Number(digito) * peso;
    }, 0);

  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

export class CustomValidators {
  static useExistingCpfValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isValid = validarCPF(control.value);
      return isValid ? null : { cpfInvalido: true };
    };
  }
}
