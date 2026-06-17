package com.bantads.conta.mensageria;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bantads.conta.config.RabbitMqConfiguracao;
import com.bantads.conta.entity.leitura.ContaLeitura;
import com.bantads.conta.entity.leitura.MovimentacaoLeitura;
import com.bantads.conta.repository.leitura.RepositorioContaLeitura;
import com.bantads.conta.repository.leitura.RepositorioMovimentacaoLeitura;

@Component
public class ConsumidorMovimentacaoConta {

    private final RepositorioContaLeitura repositorioContaLeitura;
    private final RepositorioMovimentacaoLeitura repositorioMovimentacaoLeitura;

    public ConsumidorMovimentacaoConta(
        RepositorioContaLeitura repositorioContaLeitura,
        RepositorioMovimentacaoLeitura repositorioMovimentacaoLeitura
    ) {
        this.repositorioContaLeitura = repositorioContaLeitura;
        this.repositorioMovimentacaoLeitura = repositorioMovimentacaoLeitura;
    }

    @RabbitListener(queues = RabbitMqConfiguracao.FILA_MOVIMENTACAO)
    @Transactional("gerenciadorTransacaoLeitura")
    public void consumir(EventoMovimentacaoConta evento) {
        ContaLeitura contaLeitura = repositorioContaLeitura.findById(evento.conta())
            .orElseGet(ContaLeitura::new);

        contaLeitura.setNumero(evento.conta());
        contaLeitura.setCliente(evento.cliente());
        contaLeitura.setGerente(evento.gerente());
        contaLeitura.setLimite(evento.limite());
        contaLeitura.setSaldo(evento.saldo());
        contaLeitura.setCriacao(evento.criacaoConta());

        repositorioContaLeitura.save(contaLeitura);

        MovimentacaoLeitura movimentacaoLeitura = new MovimentacaoLeitura();
        movimentacaoLeitura.setConta(evento.conta());
        movimentacaoLeitura.setData(evento.dataMovimentacao());
        movimentacaoLeitura.setTipo(evento.tipo().getDescricao());
        movimentacaoLeitura.setOrigem(evento.origem());
        movimentacaoLeitura.setDestino(evento.destino());
        movimentacaoLeitura.setValor(evento.valor());

        repositorioMovimentacaoLeitura.save(movimentacaoLeitura);
    }
}
