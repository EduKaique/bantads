import {
  criarGruposTransacoes,
  mapearMovimentacoesDoExtrato,
} from './008-consulta-de-extrato.utils';
import { ExtratoTransaction } from './extrato-transaction.model';

describe('008-consulta-de-extrato.utils', () => {
  describe('mapearMovimentacoesDoExtrato', () => {
    it('deve reconhecer tipos em caixa alta e sem acento', () => {
      const transacoes = mapearMovimentacoesDoExtrato(
        [
          {
            data: '2026-04-07T10:00:00-03:00',
            tipo: 'DEPOSITO',
            origem: null,
            destino: '1291',
            valor: 100,
          },
          {
            data: '2026-04-07T11:00:00-03:00',
            tipo: 'SAQUE',
            origem: '1291',
            destino: null,
            valor: 50,
          },
          {
            data: '2026-04-07T12:00:00-03:00',
            tipo: 'TRANSFERENCIA',
            origem: '1291',
            destino: '0950',
            valor: 25,
          },
        ],
        '1291',
      );

      expect(transacoes.map((transacao) => transacao.operacao)).toEqual([
        'Depósito',
        'Saque',
        'Transferência',
      ]);
    });

    it('deve mapear rotulos, categorias e sinais das movimentacoes', () => {
      const transacoes = mapearMovimentacoesDoExtrato(
        [
          {
            data: '2026-04-07T10:00:00-03:00',
            tipo: 'DEPOSITO',
            origem: null,
            destino: '1291',
            valor: 100,
          },
          {
            data: '2026-04-07T11:00:00-03:00',
            tipo: 'SAQUE',
            origem: '1291',
            destino: null,
            valor: 50,
          },
          {
            data: '2026-04-07T12:00:00-03:00',
            tipo: 'TRANSFERENCIA',
            origem: '1291',
            destino: '0950',
            valor: 25,
          },
          {
            data: '2026-04-07T13:00:00-03:00',
            tipo: 'TRANSFERENCIA',
            origem: '0950',
            destino: '1291',
            valor: 75,
          },
        ],
        '1291',
      );

      expect(transacoes.map((transacao) => transacao.operacao)).toEqual([
        'Depósito',
        'Saque',
        'Transferência',
        'Transferência',
      ]);
      expect(transacoes.map((transacao) => transacao.categoria)).toEqual([
        'Operação bancária',
        'Operação bancária',
        'Transferência',
        'Transferência',
      ]);
      expect(transacoes.map((transacao) => transacao.operacaoColor)).toEqual([
        'blue',
        'red',
        'red',
        'blue',
      ]);
    });
  });

  it('deve incluir transacoes do mesmo dia mesmo com horario no filtro', () => {
    const transacoes: ExtratoTransaction[] = [
      {
        data: '06/04/2026',
        hora: '10:30',
        operacao: 'Depósito',
        valor: 'R$100,00',
        operacaoColor: 'blue',
      },
    ];

    const dataComHorario = new Date(2026, 3, 6, 14, 45, 0, 0);

    const grupos = criarGruposTransacoes(
      transacoes,
      dataComHorario,
      dataComHorario,
      100,
    );

    expect(grupos.length).toBe(1);
    expect(grupos[0].transacoes.length).toBe(1);
  });
});
