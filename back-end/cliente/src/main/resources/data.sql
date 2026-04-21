INSERT INTO ms_cliente.clientes (cpf, nome, email, telefone, salario, status, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES 
('12912861012','Catharyna','cli1@bantads.com.br','(41) 99999-1111', 10000.0, 'APROVADO', '80000000', 'Rua A', '10', 'Apto 1', 'Centro', 'Curitiba', 'PR'),
('22233344455','João Silva','cli2@bantads.com.br','(11) 98888-2222', 4500.0, 'APROVADO', '01000000', 'Av Paulista', '1000', '', 'Bela Vista', 'São Paulo', 'SP'),
('33344455566','Maria Souza','cli3@bantads.com.br','(21) 97777-3333', 3000.0, 'REJEITADO', '20000000', 'Rua Copacabana', '50', '', 'Copacabana', 'Rio de Janeiro', 'RJ'),
('44455566677','Carlos Mendes','cli4@bantads.com.br','(31) 96666-4444', 8000.0, 'PENDENTE', '30000000', 'Av Afonso Pena', '100', '', 'Savassi', 'Belo Horizonte', 'MG'),
('55566677788','Ana Paula','cli5@bantads.com.br','(51) 95555-5555', 12000.0, 'PENDENTE', '90000000', 'Av Borges de Medeiros', '200', '', 'Centro', 'Porto Alegre', 'RS')
ON CONFLICT (cpf) DO NOTHING;