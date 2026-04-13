-- Inserts Iniciais para o lado da ESCRITA (Command)
INSERT INTO ms_conta_cud.conta (id, cliente_id, saldo, limite) 
VALUES (1, 1001, 1500.00, 500.00) ON CONFLICT DO NOTHING;

INSERT INTO ms_conta_cud.conta (id, cliente_id, saldo, limite) 
VALUES (2, 1002, 250.00, 1000.00) ON CONFLICT DO NOTHING;

-- Inserts Iniciais sincronizados para o lado da LEITURA (Query)
INSERT INTO ms_conta_r.conta_view (id, cliente_id, saldo, limite) 
VALUES (1, 1001, 1500.00, 500.00) ON CONFLICT DO NOTHING;

INSERT INTO ms_conta_r.conta_view (id, cliente_id, saldo, limite) 
VALUES (2, 1002, 250.00, 1000.00) ON CONFLICT DO NOTHING;