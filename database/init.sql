-- Cria o banco principal
-- \c bantads_db; -- Conecta no banco

-- Schema para o microsserviço de cliente
CREATE SCHEMA IF NOT EXISTS ms_cliente;

-- Schemas para o MS Conta (Padrão CQRS)
CREATE SCHEMA IF NOT EXISTS ms_conta_cud; -- Escrita (Command)
CREATE SCHEMA IF NOT EXISTS ms_conta_r;   -- Leitura (Query)

-- Schema para o microsserviço de gerente
CREATE SCHEMA IF NOT EXISTS ms_gerente;

-- Dá permissões ao usuário que o Spring usa
GRANT ALL ON SCHEMA ms_cliente TO springuser;
GRANT ALL ON SCHEMA ms_conta_cud TO springuser;
GRANT ALL ON SCHEMA ms_conta_r TO springuser;
GRANT ALL ON SCHEMA ms_gerente TO springuser;