import { formatCurrency } from '../../../../shared/utils/formatters';
import { Transaction } from '../../../../../assets/mock/transactions.mock';

export interface GrupoTransacoes {
  data: string;
  saldoDoDia: string;
  transacoes: Transaction[];
}

export interface MovimentacaoExtratoApi {
  data: string;
  tipo: string;
  origem: string | null;
  destino: string | null;
  valor: number;
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

export function mapearMovimentacoesDoExtrato(
  movimentacoes: MovimentacaoExtratoApi[],
  numeroConta: string,
): Transaction[] {
  return movimentacoes.map((movimentacao) => {
    const transferenciaRecebida =
      movimentacao.tipo === 'transferência' &&
      movimentacao.destino === numeroConta &&
      movimentacao.origem !== numeroConta;

    return {
      data: formatarDataParaInput(new Date(movimentacao.data)),
      hora: extrairHoraDaDataIso(movimentacao.data),
      operacao: mapearTipoOperacao(movimentacao.tipo),
      remetenteDestinatario: mapearRemetenteDestinatario(
        movimentacao,
        numeroConta,
      ),
      categoria: mapearCategoria(movimentacao.tipo),
      valor: formatCurrency(Math.abs(movimentacao.valor)),
      operacaoColor:
        movimentacao.tipo === 'saque' ||
        (movimentacao.tipo === 'transferência' && !transferenciaRecebida)
          ? 'red'
          : 'blue',
    };
  });
}

export function criarGruposTransacoes(
  transacoes: Transaction[],
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

export function calcularImpactoDasTransacoes(
  transacoes: Transaction[],
): number {
  return transacoes.reduce((saldo, transacao) => {
    const valor = parseValorMonetario(transacao.valor);
    return transacao.operacaoColor === 'blue' ? saldo + valor : saldo - valor;
  }, 0);
}

function extrairHoraDaDataIso(dataIso: string): string {
  const data = new Date(dataIso);
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function mapearTipoOperacao(tipo: string): string {
  if (tipo === 'depósito') {
    return 'Depósito';
  }

  if (tipo === 'saque') {
    return 'Saque';
  }

  return 'Transferência';
}

function mapearRemetenteDestinatario(
  movimentacao: MovimentacaoExtratoApi,
  numeroConta: string,
): string {
  if (movimentacao.tipo === 'depósito' || movimentacao.tipo === 'saque') {
    return 'Você';
  }

  if (
    movimentacao.destino === numeroConta &&
    movimentacao.origem &&
    movimentacao.origem !== numeroConta
  ) {
    return `Conta ${movimentacao.origem}`;
  }

  if (movimentacao.destino) {
    return `Conta ${movimentacao.destino}`;
  }

  return 'Você';
}

function mapearCategoria(tipo: string): string {
  if (tipo === 'transferência') {
    return 'Transferência';
  }

  return 'Operação bancária';
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
  transacoes: Transaction[],
  dataInicio: Date,
  dataFim: Date,
): Transaction[] {
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
  return (
    Number(valor.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.')) ||
    0
  );
}

function ordenarPorHora(
  transacaoA: Transaction,
  transacaoB: Transaction,
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
