export interface UsuarioSessaoEscopada {
  tipo?: string;
  email?: string;
  nome?: string;
}

export const PREFIXO_ARMAZENAMENTO_CONTA_CLIENTE = 'client-account-state';
export const PREFIXO_PRIMEIRO_ACESSO_EXTRATO = 'extrato-primeiro-acesso';
export const PREFIXO_FILTRO_EXTRATO = 'extrato-filtro';

export function buildScopedStorageKey(
  prefixo: string,
  usuario: UsuarioSessaoEscopada | null | undefined,
): string {
  return `${prefixo}:${resolveScopedSegment(usuario)}`;
}

export function hasScopedStoragePrefix(
  chave: string | null,
  prefixo: string,
): boolean {
  return !!chave?.startsWith(`${prefixo}:`);
}

function resolveScopedSegment(
  usuario: UsuarioSessaoEscopada | null | undefined,
): string {
  if (usuario?.tipo?.toLowerCase() === 'cliente') {
    return normalizeStorageKeySegment(usuario.email || usuario.nome || 'cliente');
  }

  return 'local-demo';
}

function normalizeStorageKeySegment(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
