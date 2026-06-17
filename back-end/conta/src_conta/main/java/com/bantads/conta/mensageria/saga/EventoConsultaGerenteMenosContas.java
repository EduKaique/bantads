package com.bantads.conta.mensageria.saga;

import java.util.List;

public record EventoConsultaGerenteMenosContas(
    String sagaId,
    String cpfGerenteParaRemover,
    List<String> cpfsGerentesCandidatos
) {}
