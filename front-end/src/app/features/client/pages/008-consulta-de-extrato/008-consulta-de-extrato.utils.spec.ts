import { criarGruposTransacoes } from './008-consulta-de-extrato.utils';
import { ExtratoTransaction } from './extrato-transaction.model';

describe('008-consulta-de-extrato.utils', () => {
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
