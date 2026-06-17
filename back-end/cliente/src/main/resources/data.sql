INSERT INTO ms_cliente.clientes
(cpf, nome, email, status, salario, cep, logradouro, numero, complemento, bairro, cidade, estado, conta, cpf_gerente_responsavel, telefone)
VALUES
('12912861012', 'Catharyna',  'cli1@bantads.com.br', 'APROVADO', 10000, '80000000', 'Rua A',                10, NULL, 'Centro',           'Curitiba',        'PR', '1291', '98574307084', '(41) 91234-5678'),
('09506382000', 'Cleuddônio', 'cli2@bantads.com.br', 'APROVADO', 20000, '01000000', 'Av Paulista',        1000, NULL, 'Bela Vista',       'São Paulo',        'SP', '0950', '64065268052', '(11) 92345-6789'),
('85733854057', 'Catianna',   'cli3@bantads.com.br', 'APROVADO',  3000, '20000000', 'Rua Copacabana',       50, NULL, 'Copacabana',       'Rio de Janeiro',   'RJ', '8573', '23862179060', '(21) 93456-7890'),
('58872160006', 'Cutardo',    'cli4@bantads.com.br', 'APROVADO',   500, '30000000', 'Av Afonso Pena',      100, NULL, 'Centro',           'Belo Horizonte',   'MG', '5887', '98574307084', '(31) 94567-8901'),
('76179646090', 'Coândrya',   'cli5@bantads.com.br', 'APROVADO',  1500, '90000000', 'Av Borges de Medeiros', 200, NULL, 'Moinhos de Vento', 'Porto Alegre',   'RS', '7617', '64065268052', '(51) 95678-9012')
ON CONFLICT (cpf) DO NOTHING;