import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

import { normalizarValorMonetario } from '../utils/currency.utils';

export const positiveCurrencyAmountValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const rawValue = String(control.value ?? '').trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = normalizarValorMonetario(rawValue);

  if (normalizedValue === null) {
    return { currencyFormat: true };
  }

  if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) {
    return { positiveAmount: true };
  }

  return null;
};
