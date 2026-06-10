import { FormControl } from '@angular/forms';

import { CustomValidators } from './cpf-validator';

describe('CustomValidators.useExistingCpfValidator', () => {
  const validator = CustomValidators.useExistingCpfValidator();

  it('deve aceitar campo vazio para permitir combinacao com required', () => {
    const resultado = validator(new FormControl(''));

    expect(resultado).toBeNull();
  });

  it('deve aceitar CPF valido sem mascara', () => {
    const resultado = validator(new FormControl('52998224725'));

    expect(resultado).toBeNull();
  });

  it('deve aceitar CPF valido com mascara', () => {
    const resultado = validator(new FormControl('529.982.247-25'));

    expect(resultado).toBeNull();
  });

  it('deve rejeitar CPF com quantidade incorreta de digitos', () => {
    const resultado = validator(new FormControl('529.982.247-2'));

    expect(resultado).toEqual({ cpfInvalido: true });
  });

  it('deve rejeitar CPF com digito verificador invalido', () => {
    const resultado = validator(new FormControl('529.982.247-26'));

    expect(resultado).toEqual({ cpfInvalido: true });
  });

  it('deve rejeitar CPF composto apenas por zeros', () => {
    const resultado = validator(new FormControl('000.000.000-00'));

    expect(resultado).toEqual({ cpfInvalido: true });
  });

  it('deve rejeitar CPF com todos os digitos repetidos', () => {
    const cpfsRepetidos = [
      '111.111.111-11',
      '222.222.222-22',
      '333.333.333-33',
      '444.444.444-44',
      '555.555.555-55',
      '666.666.666-66',
      '777.777.777-77',
      '888.888.888-88',
      '999.999.999-99',
    ];

    for (const cpf of cpfsRepetidos) {
      expect(validator(new FormControl(cpf))).toEqual({ cpfInvalido: true });
    }
  });
});
