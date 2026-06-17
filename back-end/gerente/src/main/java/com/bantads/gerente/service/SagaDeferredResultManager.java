package com.bantads.gerente.service;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.async.DeferredResult;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SagaDeferredResultManager {

    @SuppressWarnings("rawtypes")
    private final ConcurrentHashMap<String, DeferredResult> pendentes = new ConcurrentHashMap<>();

    @SuppressWarnings("rawtypes")
    public void registrar(String id, DeferredResult dr) {
        pendentes.put(id, dr);
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public void concluir(String id, Object resposta) {
        DeferredResult dr = pendentes.remove(id);
        if (dr != null) dr.setResult(resposta);
    }

    public void remover(String id) {
        pendentes.remove(id);
    }
}
