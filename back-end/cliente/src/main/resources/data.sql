INSERT INTO ms_cliente.clientes 
(cpf, nome, email, status, salario, cep, logradouro, numero, cidade, estado, conta, cpf_gerente_responsavel) 
VALUES
('12912861012', 'Catharyna',  'cli1@bantads.com.br', 'APROVADO', 10000, '80000000', 'Rua A', 10, 'Curitiba', 'PR', '1291', '98574307084'),
('09506382000', 'Cleuddônio', 'cli2@bantads.com.br', 'APROVADO', 20000,  '01000000', 'Av Paulista', 1000, 'São Paulo', 'SP', '0950', '64065268052'),
('85733854057', 'Catianna',   'cli3@bantads.com.br', 'APROVADO', 3000,  '20000000', 'Rua Copacabana', 50, 'Rio de Janeiro', 'RJ', '8573', '23862179060'),
('58872160006', 'Cutardo',    'cli4@bantads.com.br', 'APROVADO', 500,  '30000000', 'Av Afonso Pena', 100, 'Belo Horizonte', 'MG', '5887', '98574307084'),
('76179646090', 'Coândrya',   'cli5@bantads.com.br', 'APROVADO', 1500, '90000000', 'Av Borges de Medeiros', 200, 'Porto Alegre', 'RS', '7617', '64065268052')
ON CONFLICT (cpf) DO NOTHING;