import { formatCurrency } from '../../../../shared/utils/formatters';
import { TransacaoExtratoMock } from '../../services/client-account.service';
import { ExtratoTransaction } from './extrato-transaction.model';

export interface GrupoTransacoes {
  data: string;
  saldoDoDia: string;
  transacoes: ExtratoTransaction[];
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

export function mapearTransacoesDoExtratoMock(
  transacoes: TransacaoExtratoMock[],
  numeroContaAtual: string,
): ExtratoTransaction[] {
  return transacoes.map((transacao) => {
    const dataHora = new Date(transacao.dataHora);
    const transferenciaEntrada =
      transacao.tipo === 'TRANSFERENCIA' &&
      transacao.contaDestino === numeroContaAtual;

    return {
      data: formatarDataParaInput(dataHora),
      hora: extrairHoraDaDataIso(transacao.dataHora),
      operacao: mapearTipoOperacaoExtrato(transacao.tipo),
      remetenteDestinatario: obterContraparteDaTransacao(
        transacao,
        numeroContaAtual,
      ),
      categoria: 'Operação bancária',
      valor: formatCurrency(Math.abs(transacao.valor)),
      operacaoColor:
        transferenciaEntrada || transacao.tipo === 'DEPOSITO' ? 'blue' : 'red',
    };
  });
}

export function criarGruposTransacoes(
  transacoes: ExtratoTransaction[],
  dataInicio: Date,
  dataFim: Date,
  saldoAtual: number,
): GrupoTransacoes[] {
  const gruposPorData = new Map<string, GrupoTransacoes>();
  const dataInicialNormalizada = normalizarInicioDoDia(dataInicio);
  const dataFinalNormalizada = normalizarFimDoDia(dataFim);

  for (const data of gerarIntervaloDatas(
    dataInicialNormalizada,
    dataFinalNormalizada,
  )) {
    const dataFormatada = formatarDataParaInput(data);
    gruposPorData.set(dataFormatada, {
      data: formatarCabecalhoData(dataFormatada),
      saldoDoDia: calcularSaldoDoDia(data, transacoes, saldoAtual),
      transacoes: [],
    });
  }

  for (const transacao of filtrarTransacoesPorPeriodo(
    transacoes,
    dataInicialNormalizada,
    dataFinalNormalizada,
  )) {
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

function mapearTipoOperacaoExtrato(
  tipo: TransacaoExtratoMock['tipo'],
): string {
  if (tipo === 'DEPOSITO') {
    return 'Depósito';
  }

  if (tipo === 'SAQUE') {
    return 'Saque';
  }

  return 'Transferência';
}

function obterContraparteDaTransacao(
  transacao: TransacaoExtratoMock,
  numeroContaAtual: string,
): string | undefined {
  if (transacao.tipo !== 'TRANSFERENCIA') {
    return undefined;
  }

  if (transacao.contaOrigem === numeroContaAtual) {
    return transacao.nomeDestino || transacao.contaDestino || undefined;
  }

  return transacao.nomeOrigem || transacao.contaOrigem || undefined;
}

function gerarIntervaloDatas(dataInicio: Date, dataFim: Date): Date[] {
  const datas: Date[] = [];
  const cursor = normalizarInicioDoDia(dataInicio);

  while (cursor <= dataFim) {
    datas.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return datas;
}

function filtrarTransacoesPorPeriodo(
  transacoes: ExtratoTransaction[],
  dataInicio: Date,
  dataFim: Date,
): ExtratoTransaction[] {
  const dataInicialNormalizada = normalizarInicioDoDia(dataInicio);
  const dataFinalNormalizada = normalizarFimDoDia(dataFim);

  return transacoes.filter((transacao) => {
    const dataTransacao = parseDataBr(transacao.data);
    return (
      dataTransacao >= dataInicialNormalizada &&
      dataTransacao <= dataFinalNormalizada
    );
  });
}

function formatarCabecalhoData(data: string): string {
  return FORMATO_DATA_CABECALHO.format(parseDataBr(data));
}

function calcularSaldoDoDia(
  dataReferencia: Date,
  transacoes: ExtratoTransaction[],
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
  return (
    Number(valor.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.')) ||
    0
  );
}

function ordenarPorHora(
  transacaoA: ExtratoTransaction,
  transacaoB: ExtratoTransaction,
): number {
  return (transacaoA.hora || '00:00').localeCompare(
    transacaoB.hora || '00:00',
  );
}

function normalizarInicioDoDia(data: Date): Date {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
    0,
    0,
    0,
    0,
  );
}

function normalizarFimDoDia(data: Date): Date {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
    23,
    59,
    59,
    999,
  );
}
