const amountPattern = /^\d+(?:[.,]\d{1,2})?$/;

export function normalizarValorMonetario(rawValue: string): number | null {
  const cleanedValue = rawValue
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();

  if (!cleanedValue || !amountPattern.test(cleanedValue.replace('.', ','))) {
    return null;
  }

  const normalizedValue = Number(cleanedValue);

  return Number.isFinite(normalizedValue) ? normalizedValue : null;
}
