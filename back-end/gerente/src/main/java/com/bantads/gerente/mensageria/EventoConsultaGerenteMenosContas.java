package com.bantads.gerente.mensageria;

import java.util.List;

public record EventoConsultaGerenteMenosContas(
    String sagaId,
    String cpfGerenteParaRemover,
    List<String> cpfsGerentesCandidatos
) {}
