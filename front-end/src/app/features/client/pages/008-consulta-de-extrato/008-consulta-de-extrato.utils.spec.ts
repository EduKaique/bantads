import {
  calcularImpactoDasTransacoes,
  criarGruposTransacoes,
} from './008-consulta-de-extrato.utils';
import { Transaction } from '../../../../../assets/mock/transactions.mock';

describe('008-consulta-de-extrato.utils', () => {
  it('deve incluir transacoes do mesmo dia mesmo com horario no filtro', () => {
    const transacoes: Transaction[] = [
      {
        data: '06/04/2026',
        hora: '10:30',
        operacao: 'DeposÃ³sito',
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

  it('deve calcular o impacto do historico exibido no saldo atual', () => {
    const transacoes: Transaction[] = [
      {
        data: '05/04/2026',
        operacao: 'DeposÃ³sito',
        valor: 'R$150,00',
        operacaoColor: 'blue',
      },
      {
        data: '06/04/2026',
        operacao: 'Saque',
        valor: 'R$40,00',
        operacaoColor: 'red',
      },
    ];

    expect(calcularImpactoDasTransacoes(transacoes)).toBe(110);
  });
});
