package com.bantads.conta.repository.leitura;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bantads.conta.entity.leitura.MovimentacaoLeitura;

public interface RepositorioMovimentacaoLeitura extends JpaRepository<MovimentacaoLeitura, Long> {

    List<MovimentacaoLeitura> findByContaOrderByDataDesc(String conta);
}
