INSERT INTO ms_cliente.clientes (cpf, nome, email, telefone, salario, status, endereco, cep, cidade, estado)
VALUES  
  ('12912861012','Catharyna','cli1@bantads.com.br','(41) 99999-1111', 10000.0,'APROVADO', 'Rua A, 10', '80000000', 'Curitiba', 'PR'),
  ('09506382000','Cleuddônio','cli2@bantads.com.br','(41) 99999-2222', 20000.0,'APROVADO', 'Rua B, 20', '80000001', 'Curitiba', 'PR'),
  ('85733854057','Catianna','cli3@bantads.com.br','(41) 99999-3333', 3000.0,'APROVADO', 'Rua C, 30', '80000002', 'Curitiba', 'PR'),
  ('58872160006','Cutardo','cli4@bantads.com.br','(41) 99999-4444', 500.0,'APROVADO', 'Rua D, 40', '80000003', 'Curitiba', 'PR'),
  ('76179646090','Coândrya','cli5@bantads.com.br','(41) 99999-5555', 1500.0,'APROVADO', 'Rua E, 50', '80000004', 'Curitiba', 'PR')
ON CONFLICT (cpf) DO NOTHING;