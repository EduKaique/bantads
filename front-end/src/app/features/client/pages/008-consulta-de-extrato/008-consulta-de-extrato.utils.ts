import { AccountTransaction } from '../../../../shared/models/account-transaction';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { Transaction } from '../../../../../assets/mock/transactions.mock';

export interface GrupoTransacoes {
  data: string;
  saldoDoDia: string;
  transacoes: Transaction[];
}

interface FiltroPersistidoExtrato {
  dataInicio: string;
  dataFim: string;
}

const FORMATO_DATA_CABECALHO = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function mapearTransacoesDaConta(
  transacoes: AccountTransaction[],
): Transaction[] {
  return transacoes.map((transacao) => ({
    data: formatarDataParaInput(new Date(transacao.performedAt)),
    hora: extrairHoraDaDataIso(transacao.performedAt),
    operacao: mapearTipoOperacao(transacao.type),
    remetenteDestinatario: 'Você',
    categoria: 'Operação bancária',
    valor: formatCurrency(Math.abs(transacao.amount)),
    operacaoColor: transacao.type === 'withdrawal' ? 'red' : 'blue',
  }));
}

export function criarGruposTransacoes(
  transacoes: Transaction[],
  dataInicio: Date,
  dataFim: Date,
  saldoAtual: number,
): GrupoTransacoes[] {
  const gruposPorData = new Map<string, GrupoTransacoes>();

  for (const data of gerarIntervaloDatas(dataInicio, dataFim)) {
    const dataFormatada = formatarDataParaInput(data);
    gruposPorData.set(dataFormatada, {
      data: formatarCabecalhoData(dataFormatada),
      saldoDoDia: calcularSaldoDoDia(data, transacoes, saldoAtual),
      transacoes: [],
    });
  }

  for (const transacao of filtrarTransacoesPorPeriodo(transacoes, dataInicio, dataFim)) {
    gruposPorData.get(transacao.data)?.transacoes.push(transacao);
  }

  return Array.from(gruposPorData.values())
    .map((grupo) => ({
      ...grupo,
      transacoes: [...grupo.transacoes].sort(ordenarPorHora),
    }))
    .reverse();
}

export function formatarDataParaInput(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

export function parseDataBr(data: string): Date {
  const [dia, mes, ano] = data.split('/');
  return new Date(Number(ano), Number(mes) - 1, Number(dia), 0, 0, 0, 0);
}

export function serializarFiltroExtrato(
  dataInicio: Date,
  dataFim: Date,
): string {
  const filtro: FiltroPersistidoExtrato = {
    dataInicio: formatarDataParaInput(dataInicio),
    dataFim: formatarDataParaInput(dataFim),
  };

  return JSON.stringify(filtro);
}

export function desserializarFiltroExtrato(
  filtroPersistido: string,
): { dataInicio: Date; dataFim: Date } | null {
  try {
    const filtro = JSON.parse(filtroPersistido) as Partial<FiltroPersistidoExtrato>;

    if (!filtro.dataInicio || !filtro.dataFim) {
      return null;
    }

    return {
      dataInicio: parseDataBr(filtro.dataInicio),
      dataFim: parseDataBr(filtro.dataFim),
    };
  } catch {
    return null;
  }
}

function extrairHoraDaDataIso(dataIso: string): string {
  const data = new Date(dataIso);
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function mapearTipoOperacao(tipo: AccountTransaction['type']): string {
  if (tipo === 'deposit') {
    return 'Depósito';
  }

  return 'Saque';
}

function gerarIntervaloDatas(dataInicio: Date, dataFim: Date): Date[] {
  const datas: Date[] = [];
  const cursor = new Date(dataInicio);

  while (cursor <= dataFim) {
    datas.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return datas;
}

function filtrarTransacoesPorPeriodo(
  transacoes: Transaction[],
  dataInicio: Date,
  dataFim: Date,
): Transaction[] {
  return transacoes.filter((transacao) => {
    const dataTransacao = parseDataBr(transacao.data);
    return dataTransacao >= dataInicio && dataTransacao <= dataFim;
  });
}

function formatarCabecalhoData(data: string): string {
  return FORMATO_DATA_CABECALHO.format(parseDataBr(data));
}

function calcularSaldoDoDia(
  dataReferencia: Date,
  transacoes: Transaction[],
  saldoAtual: number,
): string {
  const saldoCalculado = transacoes.reduce((saldo, transacao) => {
    const dataTransacao = parseDataBr(transacao.data);

    if (dataTransacao <= dataReferencia) {
      return saldo;
    }

    const valor = parseValorMonetario(transacao.valor);
    return transacao.operacaoColor === 'blue' ? saldo - valor : saldo + valor;
  }, saldoAtual);

  return formatCurrency(saldoCalculado);
}

function parseValorMonetario(valor: string): number {
  return Number(
    valor.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.'),
  ) || 0;
}

function ordenarPorHora(transacaoA: Transaction, transacaoB: Transaction): number {
  return (transacaoA.hora || '00:00').localeCompare(transacaoB.hora || '00:00');
}
