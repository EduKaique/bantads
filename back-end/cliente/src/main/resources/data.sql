INSERT INTO ms_cliente.clientes (cpf, nome, email, status, salario, cep, logradouro, numero, cidade, estado) VALUES
('12912861012', 'Catharyna',  'cli1@bantads.com.br', 'APROVADO', 10000, '80000000', 'Rua A', 10, 'Curitiba', 'PR'),
('09506382000', 'Cleuddônio', 'cli2@bantads.com.br', 'APROVADO', 4500,  '01000000', 'Av Paulista', 1000, 'São Paulo', 'SP'),
('85733854057', 'Catianna',   'cli3@bantads.com.br', 'APROVADO', 3000,  '20000000', 'Rua Copacabana', 50, 'Rio de Janeiro', 'RJ'),
('58872160006', 'Cutardo',    'cli4@bantads.com.br', 'APROVADO', 8000,  '30000000', 'Av Afonso Pena', 100, 'Belo Horizonte', 'MG'),
('76179646090', 'Coândrya',   'cli5@bantads.com.br', 'APROVADO', 12000, '90000000', 'Av Borges de Medeiros', 200, 'Porto Alegre', 'RS')
ON CONFLICT (cpf) DO NOTHING;