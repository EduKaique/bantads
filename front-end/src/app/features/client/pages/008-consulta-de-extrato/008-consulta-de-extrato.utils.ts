import { formatCurrency } from '../../../../shared/utils/formatters';
import { ExtratoTransaction } from './extrato-transaction.model';

export interface GrupoTransacoes {
  data: string;
  saldoDoDia: string;
  transacoes: ExtratoTransaction[];
}

export interface MovimentacaoExtratoApi {
  data: string;
  tipo: string;
  origem: string | null;
  destino: string | null;
  valor: number;
}

type TipoMovimentacao = 'deposito' | 'saque' | 'transferencia';

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
): ExtratoTransaction[] {
  // Centraliza a conversao para manter o componente focado em estado e interacao.
  return movimentacoes.map((movimentacao) => {
    const tipoMovimentacao = normalizarTipoMovimentacao(movimentacao.tipo);
    // Transferencia recebida e positiva apenas quando a conta atual aparece como destino.
    const transferenciaRecebida =
      tipoMovimentacao === 'transferencia' &&
      movimentacao.destino === numeroConta &&
      movimentacao.origem !== numeroConta;

    return {
      data: formatarDataParaInput(new Date(movimentacao.data)),
      hora: extrairHoraDaDataIso(movimentacao.data),
      operacao: mapearTipoOperacao(tipoMovimentacao),
      remetenteDestinatario: mapearRemetenteDestinatario(
        movimentacao,
        numeroConta,
        tipoMovimentacao,
      ),
      categoria: mapearCategoria(tipoMovimentacao),
      valor: Math.abs(Number(movimentacao.valor) || 0),
      operacaoColor:
        tipoMovimentacao === 'saque' ||
        (tipoMovimentacao === 'transferencia' && !transferenciaRecebida)
          ? 'red'
          : 'blue',
    };
  });
}

export function criarGruposTransacoes(
  transacoes: ExtratoTransaction[],
  dataInicio: Date,
  dataFim: Date,
  saldoAtual: number,
): GrupoTransacoes[] {
  // O mapa garante um grupo por dia, mesmo quando nao ha transacoes no periodo.
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
      // As transacoes do dia ficam em ordem cronologica antes da inversao dos grupos.
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
    // O parse tolera valores antigos ou incompletos gravados no sessionStorage.
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
  transacoes: ExtratoTransaction[],
): number {
  // Azul representa entrada no extrato; vermelho representa saida de saldo.
  return transacoes.reduce((saldo, transacao) => {
    return transacao.operacaoColor === 'blue'
      ? saldo + transacao.valor
      : saldo - transacao.valor;
  }, 0);
}

function normalizarTipoMovimentacao(tipo: string): TipoMovimentacao {
  // Remove acentos para aceitar tanto valores da API quanto textos ja formatados.
  const tipoNormalizado = tipo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (tipoNormalizado === 'deposito') {
    return 'deposito';
  }

  if (tipoNormalizado === 'saque') {
    return 'saque';
  }

  return 'transferencia';
}

function extrairHoraDaDataIso(dataIso: string): string {
  const data = new Date(dataIso);
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function mapearTipoOperacao(tipo: TipoMovimentacao): string {
  if (tipo === 'deposito') {
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
  tipoMovimentacao: TipoMovimentacao,
): string {
  // Depositos e saques sao movimentos da propria conta, sem contraparte externa.
  if (tipoMovimentacao === 'deposito' || tipoMovimentacao === 'saque') {
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

function mapearCategoria(tipo: TipoMovimentacao): string {
  if (tipo === 'transferencia') {
    return 'Transferência';
  }

  return 'Operação bancária';
}

function gerarIntervaloDatas(dataInicio: Date, dataFim: Date): Date[] {
  // Gera datas inclusivas para exibir dias vazios dentro do filtro selecionado.
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
  // A comparacao usa datas normalizadas para nao perder transacoes por horario.
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
  // Parte do saldo atual e desfaz movimentos posteriores para chegar ao saldo do dia.
  const saldoCalculado = transacoes.reduce((saldo, transacao) => {
    const dataTransacao = parseDataBr(transacao.data);

    if (dataTransacao <= dataReferencia) {
      return saldo;
    }

    return transacao.operacaoColor === 'blue'
      ? saldo - transacao.valor
      : saldo + transacao.valor;
  }, saldoAtual);

  return formatCurrency(saldoCalculado);
}

function ordenarPorHora(
  transacaoA: ExtratoTransaction,
  transacaoB: ExtratoTransaction,
): number {
  // Valores sem hora vao para o inicio do dia para manter ordenacao deterministica.
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
