// ================= CPF =================
export function formatCpf(cpf: string): string {
  if (!cpf) return '';

  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return cpf;

  return digits.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
}

// ================= CEP =================
export function formatCep(cep: string): string {
  if (!cep) return '';

  const digits = cep.replace(/\D/g, '');

  if (digits.length !== 8) return cep;

  return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// ================= TELEFONE =================
export function formatPhone(phone: string): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

// ================= MOEDA =================
export function formatCurrency(value: number): string {
  if (value === null || value === undefined) return '--';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// ================= SOMENTE NÚMEROS =================
export function removeNonDigits(value: string): string {
  return value?.replace(/\D/g, '') || '';
}

// ================= DATA =================
export function formatDateBR(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// ================= HORA =================
export function formatTimeBR(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(':', 'h');
}