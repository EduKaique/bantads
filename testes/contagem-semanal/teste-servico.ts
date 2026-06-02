export interface RegistroTesteServico {
  codigo: string;
  descricao: string;
  ativo: boolean;
}

export class TesteServico {
  private readonly registros: RegistroTesteServico[] = [];

  adicionar(registro: RegistroTesteServico): void {
    this.registros.push({
      codigo: registro.codigo,
      descricao: registro.descricao,
      ativo: registro.ativo,
    });
  }

  listarAtivos(): RegistroTesteServico[] {
    return this.registros
      .filter((registro) => registro.ativo)
      .map((registro) => ({ ...registro }));
  }

  contar(): number {
    return this.registros.length;
  }
}

export const criarTesteServico = (): TesteServico => {
  const servico = new TesteServico();

  servico.adicionar({
    codigo: 'teste-01',
    descricao: 'Registro de teste sem impacto no sistema.',
    ativo: true,
  });

  servico.adicionar({
    codigo: 'teste-02',
    descricao: 'Registro auxiliar para validacao isolada.',
    ativo: false,
  });

  return servico;
};

const servico = criarTesteServico();
export const totalRegistrosTeste = servico.contar();
export const registrosAtivosTeste = servico.listarAtivos();
export const testeServicoPronto = totalRegistrosTeste > 0;
