-- CREATE DATABASE IF NOT EXISTS bantads_db;
-- GRANT ALL PRIVILEGES ON bantads_db.* TO 'springuser'@'%';
-- FLUSH PRIVILEGES;

-- USE bantads_db; comentado pois bantads_cliente já é criado no docker compose 

CREATE SCHEMA IF NOT EXISTS ms_cliente;

-- Permissões
GRANT ALL ON SCHEMA ms_cliente TO springuser;