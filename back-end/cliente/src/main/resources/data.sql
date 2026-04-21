INSERT INTO ms_cliente.clientes (cpf, nome, email, telefone, salario, status, cep, logradouro, numero, complemento, bairro, cidade, estado)
VALUES ('12912861012','Catharyna','cli1@bantads.com.br','(41) 99999-1111', 10000.0,'APROVADO', '80000000', 'Rua A', '10', 'Apto 1', 'Centro', 'Curitiba', 'PR')
ON CONFLICT (cpf) DO NOTHING;